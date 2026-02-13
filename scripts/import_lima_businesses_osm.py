#!/usr/bin/env python3
"""
Importa negocios de OpenStreetMap (Overpass API) al esquema de LimaCentro.

Uso:
  DATABASE_URL="postgresql://..." .venv/bin/python scripts/import_lima_businesses_osm.py --limit 250
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

import psycopg2
import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
DEFAULT_CENTER_LAT = -12.0464
DEFAULT_CENTER_LNG = -77.0428
DEFAULT_RADIUS_METERS = 3500
DEFAULT_SYSTEM_EMAIL = "osm-import@limacentro.com"

ALLOWED_AMENITIES = {
    "restaurant",
    "fast_food",
    "cafe",
    "bar",
    "pub",
    "marketplace",
    "pharmacy",
    "bank",
    "atm",
    "clinic",
    "dentist",
    "veterinary",
    "hairdresser",
    "beauty_salon",
    "car_rental",
    "car_wash",
    "fuel",
    "cinema",
    "theatre",
}

ALLOWED_TOURISM = {
    "hotel",
    "hostel",
    "guest_house",
    "motel",
    "apartment",
}


@dataclass
class ParsedBusiness:
    name: str
    category: str
    district: str
    address: str
    description: str
    phone: Optional[str]
    website: Optional[str]
    lat: float
    lng: float
    rating: float
    image_url: Optional[str]
    source_id: str


def build_query(lat: float, lng: float, radius: int) -> str:
    return f"""
[out:json][timeout:120];
(
  node["name"]["shop"](around:{radius},{lat},{lng});
  way["name"]["shop"](around:{radius},{lat},{lng});
  relation["name"]["shop"](around:{radius},{lat},{lng});
  node["name"]["amenity"](around:{radius},{lat},{lng});
  way["name"]["amenity"](around:{radius},{lat},{lng});
  relation["name"]["amenity"](around:{radius},{lat},{lng});
  node["name"]["tourism"](around:{radius},{lat},{lng});
  way["name"]["tourism"](around:{radius},{lat},{lng});
  relation["name"]["tourism"](around:{radius},{lat},{lng});
);
out center tags;
"""


def normalize_website(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = value.strip()
    if not value:
        return None
    if not value.startswith(("http://", "https://")):
        return f"https://{value}"
    return value


def normalize_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = re.sub(r"\s+", " ", value.strip())
    return value[:20] if value else None


def choose_district(tags: Dict[str, str]) -> str:
    return (
        tags.get("addr:district")
        or tags.get("addr:suburb")
        or tags.get("is_in:suburb")
        or tags.get("addr:city_district")
        or "Cercado de Lima"
    )


def choose_category(tags: Dict[str, str]) -> str:
    for key in ("shop", "amenity", "tourism", "office", "leisure", "craft"):
        value = tags.get(key)
        if value:
            return value.replace("_", " ").title()
    return "Negocio"


def is_business_like(tags: Dict[str, str]) -> bool:
    shop = tags.get("shop")
    if shop:
        return True

    amenity = tags.get("amenity")
    if amenity and amenity in ALLOWED_AMENITIES:
        return True

    tourism = tags.get("tourism")
    if tourism and tourism in ALLOWED_TOURISM:
        return True

    office = tags.get("office")
    if office and office not in {"government", "educational_institution"}:
        return True

    return False


def choose_address(name: str, tags: Dict[str, str]) -> str:
    if tags.get("addr:full"):
        return tags["addr:full"]

    street = tags.get("addr:street")
    number = tags.get("addr:housenumber")
    if street and number:
        return f"{street} {number}"
    if street:
        return street
    return f"Centro de Lima (referencia: {name})"


def choose_description(name: str, category: str, district: str, tags: Dict[str, str]) -> str:
    if tags.get("description"):
        return tags["description"][:400]
    return f"{name} ({category}) en {district}, importado desde OpenStreetMap."


def parse_elements(elements: Iterable[Dict], limit: int) -> List[ParsedBusiness]:
    parsed: List[ParsedBusiness] = []
    seen: set[Tuple[str, int, int]] = set()

    for el in elements:
        if len(parsed) >= limit:
            break

        tags = el.get("tags") or {}
        name = (tags.get("name") or "").strip()
        if not name:
            continue
        if not is_business_like(tags):
            continue

        lat = el.get("lat")
        lng = el.get("lon")
        if lat is None or lng is None:
            center = el.get("center") or {}
            lat = center.get("lat")
            lng = center.get("lon")
        if lat is None or lng is None:
            continue

        dedupe_key = (name.lower(), int(float(lat) * 100000), int(float(lng) * 100000))
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)

        category = choose_category(tags)
        district = choose_district(tags)

        parsed.append(
            ParsedBusiness(
                name=name[:255],
                category=category[:255],
                district=district[:255],
                address=choose_address(name, tags)[:255],
                description=choose_description(name, category, district, tags),
                phone=normalize_phone(tags.get("phone") or tags.get("contact:phone")),
                website=normalize_website(tags.get("website") or tags.get("contact:website")),
                lat=float(lat),
                lng=float(lng),
                rating=4.5,
                image_url=None,
                source_id=f"{el.get('type','x')}/{el.get('id','0')}",
            )
        )

    return parsed


def fetch_osm_businesses(lat: float, lng: float, radius: int, limit: int) -> List[ParsedBusiness]:
    query = build_query(lat, lng, radius)
    response = requests.post(OVERPASS_URL, data={"data": query}, timeout=180)
    response.raise_for_status()
    payload = response.json()
    elements = payload.get("elements", [])
    return parse_elements(elements, limit=limit)


def ensure_system_user(cur, email: str) -> int:
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    if row:
        return int(row[0])

    placeholder_hash = "oauth:osm_import_system_user"
    cur.execute(
        """
        INSERT INTO users (email, password_hash, name, avatar_url)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """,
        (email, placeholder_hash, "OSM Import Bot", None),
    )
    created = cur.fetchone()
    return int(created[0])


def load_existing_keys(cur) -> set[Tuple[str, int, int]]:
    cur.execute("SELECT name, lat::float8, lng::float8 FROM businesses")
    keys = set()
    for name, lat, lng in cur.fetchall():
        keys.add((name.lower(), int(float(lat) * 100000), int(float(lng) * 100000)))
    return keys


def insert_businesses(cur, user_id: int, businesses: List[ParsedBusiness]) -> Tuple[int, int]:
    existing = load_existing_keys(cur)
    inserted = 0
    skipped = 0

    for b in businesses:
        key = (b.name.lower(), int(b.lat * 100000), int(b.lng * 100000))
        if key in existing:
            skipped += 1
            continue

        cur.execute(
            """
            INSERT INTO businesses
              (user_id, name, category, district, address, description, phone, website, rating, lat, lng, image_url)
            VALUES
              (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                b.name,
                b.category,
                b.district,
                b.address,
                b.description,
                b.phone,
                b.website,
                b.rating,
                b.lat,
                b.lng,
                b.image_url,
            ),
        )
        inserted += 1
        existing.add(key)

    return inserted, skipped


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Importar negocios OSM a LimaCentro DB")
    parser.add_argument("--lat", type=float, default=DEFAULT_CENTER_LAT)
    parser.add_argument("--lng", type=float, default=DEFAULT_CENTER_LNG)
    parser.add_argument("--radius", type=int, default=DEFAULT_RADIUS_METERS)
    parser.add_argument("--limit", type=int, default=250)
    parser.add_argument("--system-email", type=str, default=DEFAULT_SYSTEM_EMAIL)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL no está definida.", file=sys.stderr)
        return 1

    print("Consultando Overpass API...")
    businesses = fetch_osm_businesses(args.lat, args.lng, args.radius, args.limit)
    print(f"Negocios parseados desde OSM: {len(businesses)}")
    if not businesses:
        print("No se obtuvieron resultados para importar.")
        return 0

    conn = psycopg2.connect(database_url)
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            user_id = ensure_system_user(cur, args.system_email)
            inserted, skipped = insert_businesses(cur, user_id, businesses)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    print(f"Insertados: {inserted}")
    print(f"Omitidos (duplicados): {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
