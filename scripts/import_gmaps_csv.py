#!/usr/bin/env python3
"""
Importa el CSV producido por gosom/google-maps-scraper al esquema de LimaCentro.

Flujo completo (ver scripts/SCRAPING.md para detalles y advertencias legales):

  1. Genera queries:
       python3 scripts/generate_gmaps_queries.py > gmaps_queries.txt

  2. Ejecuta el scraper (Docker):
       docker run -v gmaps-cache:/opt \
         -v "$PWD/gmaps_queries.txt:/queries.txt:ro" \
         -v "$PWD/gmaps-output:/out" \
         gosom/google-maps-scraper \
         -input /queries.txt -results /out/results.csv -depth 1 -exit-on-inactivity 3m

  3. Importa a la base:
       DATABASE_URL="postgresql://..." python3 scripts/import_gmaps_csv.py gmaps-output/results.csv

El importador es tolerante a los nombres de columna del scraper
(title/name, review_rating/rating, latitude/lat, data_id/cid, ...).
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
from typing import Dict, List, Optional, Tuple

import psycopg2

DEFAULT_SYSTEM_EMAIL = "gmaps-import@limacentro.com"

# gosom scraper puede emitir distintas cabeceras según versión
COLUMN_ALIASES = {
    "name": ["title", "name", "business_name"],
    "category": ["category", "categories", "subtypes", "type"],
    "address": ["address", "full_address", "street"],
    "phone": ["phone", "phone_number", "phones"],
    "website": ["website", "site", "url_website"],
    "rating": ["review_rating", "rating", "stars", "review_score"],
    "lat": ["latitude", "lat"],
    "lng": ["longitude", "lng", "lon"],
    "source_id": ["data_id", "cid", "place_id", "feature_id", "input_id"],
    "link": ["link", "google_maps_link"],
}


def pick(row: Dict[str, str], field: str) -> Optional[str]:
    for alias in COLUMN_ALIASES[field]:
        value = row.get(alias)
        if value and value.strip():
            return value.strip()
    return None


def map_category(raw: Optional[str]) -> str:
    if not raw:
        return "Otros"
    text = raw.lower()
    if any(k in text for k in ("restaurant", "café", "cafe", "bar", "food", "pizzeria", "chifa", "cevicher")):
        return "Restaurante"
    if any(k in text for k in ("hotel", "hostal", "lodging", "hostel")):
        return "Hotel"
    if any(k in text for k in ("pharm", "clinic", "dentist", "doctor", "hospital", "salud", "veterinar")):
        return "Salud"
    if any(k in text for k in ("school", "colegio", "academ", "univers", "educat")):
        return "Educación"
    if any(k in text for k in ("tech", "comput", "software", "electronic")):
        return "Tecnología"
    if any(k in text for k in ("museum", "tourist", "travel", "turism", "atracc")):
        return "Turismo"
    if any(k in text for k in ("store", "shop", "tienda", "market", "boutique", "bodega")):
        return "Tienda"
    if any(k in text for k in ("service", "salon", "bank", "gym", "laundry", "lavander", "taller", "belleza")):
        return "Servicios"
    return "Otros"


def guess_district(address: str) -> str:
    districts = [
        "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo",
        "Chorrillos", "Cieneguilla", "Comas", "El Agustín", "Independencia",
        "Jesús María", "La Molina", "La Victoria", "Lince", "Los Olivos",
        "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac",
        "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa",
        "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro",
        "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis",
        "San Martín de Porres", "San Miguel", "Santa Anita",
        "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo",
        "Villa El Salvador", "Villa María del Triunfo",
    ]
    low = address.lower()
    for d in districts:
        if d.lower() in low:
            return d
    return "Lima"


def normalize_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = re.sub(r"\s+", " ", value.strip())
    return value[:20] or None


def normalize_website(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = value.strip()
    if not value or not value.startswith(("http://", "https://")):
        return None
    return value[:500]


def parse_rating(value: Optional[str]) -> Optional[float]:
    if not value:
        return None
    try:
        r = float(value.replace(",", "."))
        return max(1.0, min(5.0, r))
    except ValueError:
        return None


def ensure_system_user(cur, email: str) -> int:
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    if row:
        return int(row[0])
    cur.execute(
        """
        INSERT INTO users (email, password_hash, name, avatar_url)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """,
        (email, "oauth:gmaps_import_system_user", "GMaps Import Bot", None),
    )
    return int(cur.fetchone()[0])


def load_existing(cur) -> Tuple[set, set]:
    cur.execute(
        "SELECT source_id FROM businesses WHERE source = 'gmaps' AND source_id IS NOT NULL"
    )
    source_ids = {r[0] for r in cur.fetchall()}
    cur.execute("SELECT name, lat::float8, lng::float8 FROM businesses")
    keys = {
        (name.lower(), int(float(lat) * 100000), int(float(lng) * 100000))
        for name, lat, lng in cur.fetchall()
    }
    return source_ids, keys


def main() -> int:
    parser = argparse.ArgumentParser(description="Importar CSV de google-maps-scraper")
    parser.add_argument("csv_path", help="Ruta al CSV de resultados")
    parser.add_argument("--limit", type=int, default=5000)
    parser.add_argument("--system-email", type=str, default=DEFAULT_SYSTEM_EMAIL)
    args = parser.parse_args()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL no está definida.", file=sys.stderr)
        return 1

    conn = psycopg2.connect(database_url)
    conn.autocommit = False

    inserted = 0
    skipped = 0
    invalid = 0

    try:
        with conn.cursor() as cur:
            user_id = ensure_system_user(cur, args.system_email)
            existing_source_ids, existing_keys = load_existing(cur)

            with open(args.csv_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if inserted >= args.limit:
                        break

                    name = pick(row, "name")
                    lat_s, lng_s = pick(row, "lat"), pick(row, "lng")
                    if not name or not lat_s or not lng_s:
                        invalid += 1
                        continue
                    try:
                        lat, lng = float(lat_s), float(lng_s)
                    except ValueError:
                        invalid += 1
                        continue

                    source_id = pick(row, "source_id")
                    if source_id and source_id in existing_source_ids:
                        skipped += 1
                        continue
                    key = (name.lower(), int(lat * 100000), int(lng * 100000))
                    if key in existing_keys:
                        skipped += 1
                        continue

                    address = pick(row, "address") or "Lima"
                    district = guess_district(address)
                    category = map_category(pick(row, "category"))
                    rating = parse_rating(pick(row, "rating"))

                    cur.execute(
                        """
                        INSERT INTO businesses
                          (user_id, name, category, district, address, description,
                           phone, website, rating, lat, lng, image_url, source, source_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            user_id,
                            name[:255],
                            category,
                            district,
                            address[:255],
                            f"{name} ({category}) en {district}, Lima.",
                            normalize_phone(pick(row, "phone")),
                            normalize_website(pick(row, "website")),
                            rating,
                            lat,
                            lng,
                            None,
                            "gmaps",
                            source_id,
                        ),
                    )
                    inserted += 1
                    existing_keys.add(key)
                    if source_id:
                        existing_source_ids.add(source_id)

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    print(f"Insertados: {inserted}")
    print(f"Omitidos (duplicados): {skipped}")
    print(f"Filas inválidas ignoradas: {invalid}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
