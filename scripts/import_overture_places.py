#!/usr/bin/env python3
"""
Importa lugares de Overture Maps (theme=places) al esquema de LimaCentro.

Overture Maps es un dataset abierto (CDLA-Permissive) con millones de POIs
globales — incluye nombre, categoría, coordenadas, direcciones, teléfonos,
websites y confianza. Legal, gratis y sin rate-limits ni bloqueos.

Uso:
  pip install overturemaps psycopg2-binary pyarrow
  DATABASE_URL="postgresql://..." python3 scripts/import_overture_places.py

Opciones:
  --bbox "min_lng,min_lat,max_lng,max_lat"   Bounding box (default: Lima metropolitana)
  --limit N                                 Máximo de registros a insertar
  --min-confidence 0.7                      Confianza mínima de Overture (0-1)
  --system-email EMAIL                      Usuario dueño de los registros
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from typing import Dict, Optional, Tuple

import psycopg2

# Bounding box Lima metropolitana: min_lng, min_lat, max_lng, max_lat
DEFAULT_BBOX = (-77.16, -12.45, -76.70, -11.70)
DEFAULT_SYSTEM_EMAIL = "overture-import@limacentro.com"

# Mapeo de categorías de Overture -> categorías de LimaCentro
CATEGORY_MAP: Dict[str, str] = {
    "restaurant": "Restaurante",
    "fast_food_restaurant": "Restaurante",
    "cafe": "Restaurante",
    "bar": "Restaurante",
    "bakery": "Restaurante",
    "hotel": "Hotel",
    "hostel": "Hotel",
    "motel": "Hotel",
    "guest_house": "Hotel",
    "lodging": "Hotel",
    "pharmacy": "Salud",
    "clinic": "Salud",
    "hospital": "Salud",
    "dentist": "Salud",
    "doctor": "Salud",
    "veterinary": "Salud",
    "school": "Educación",
    "university": "Educación",
    "college": "Educación",
    "education": "Educación",
    "computer_and_software_store": "Tecnología",
    "electronics_store": "Tecnología",
    "it_services": "Tecnología",
    "museum": "Turismo",
    "tourist_attraction": "Turismo",
    "travel_agency": "Turismo",
    "art_gallery": "Turismo",
    "nightclub": "Turismo",
    "beauty_salon": "Servicios",
    "hair_salon": "Servicios",
    "bank": "Servicios",
    "atm": "Servicios",
    "car_rental": "Servicios",
    "car_wash": "Servicios",
    "laundry": "Servicios",
    "gym": "Servicios",
    "fitness_center": "Servicios",
}

# Categorías de Overture que claramente son tiendas/comercio
RETAIL_HINTS = ("store", "shop", "market", "supermarket", "boutique")


def map_category(overture_category: Optional[str]) -> str:
    if not overture_category:
        return "Otros"
    cat = overture_category.lower()
    if cat in CATEGORY_MAP:
        return CATEGORY_MAP[cat]
    if any(h in cat for h in RETAIL_HINTS):
        return "Tienda"
    return "Otros"


def normalize_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = re.sub(r"\s+", " ", str(value).strip())
    return value[:20] or None


def normalize_website(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = str(value).strip()
    if not value:
        return None
    if not value.startswith(("http://", "https://")):
        return f"https://{value}"
    return value[:500]


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
        (email, "oauth:overture_import_system_user", "Overture Import Bot", None),
    )
    return int(cur.fetchone()[0])


def load_existing(cur) -> Tuple[set, set]:
    """Devuelve (set de source_ids overture, set de keys nombre+coords)."""
    cur.execute(
        "SELECT source_id FROM businesses WHERE source = 'overture' AND source_id IS NOT NULL"
    )
    source_ids = {r[0] for r in cur.fetchall()}
    cur.execute("SELECT name, lat::float8, lng::float8 FROM businesses")
    keys = {
        (name.lower(), int(float(lat) * 100000), int(float(lng) * 100000))
        for name, lat, lng in cur.fetchall()
    }
    return source_ids, keys


def main() -> int:
    parser = argparse.ArgumentParser(description="Importar Overture Maps places a LimaCentro")
    parser.add_argument("--bbox", type=str,
                        default=",".join(str(x) for x in DEFAULT_BBOX),
                        help="min_lng,min_lat,max_lng,max_lat")
    parser.add_argument("--limit", type=int, default=2000)
    parser.add_argument("--min-confidence", type=float, default=0.0)
    parser.add_argument("--system-email", type=str, default=DEFAULT_SYSTEM_EMAIL)
    args = parser.parse_args()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL no está definida.", file=sys.stderr)
        return 1

    bbox = tuple(float(x) for x in args.bbox.split(","))
    if len(bbox) != 4:
        print("ERROR: --bbox debe tener 4 valores", file=sys.stderr)
        return 1

    try:
        import overturemaps  # pip install overturemaps
    except ImportError:
        print("ERROR: falta el paquete 'overturemaps'. Instala con:", file=sys.stderr)
        print("  pip install overturemaps psycopg2-binary pyarrow", file=sys.stderr)
        return 1

    print(f"Descargando places de Overture en bbox {bbox} (min confidence {args.min_confidence})...")
    reader = overturemaps.record_batch_reader("place", bbox=bbox)

    conn = psycopg2.connect(database_url)
    conn.autocommit = False

    inserted = 0
    skipped = 0
    try:
        with conn.cursor() as cur:
            user_id = ensure_system_user(cur, args.system_email)
            existing_source_ids, existing_keys = load_existing(cur)

            for batch in reader:
                cols = batch.to_pydict()
                n = batch.num_rows
                for i in range(n):
                    if inserted >= args.limit:
                        break

                    confidence = (cols.get("confidence") or [0])[i] or 0
                    if confidence < args.min_confidence:
                        continue

                    names = (cols.get("names") or [None])[i] or {}
                    name = (names.get("primary") or "").strip()
                    if not name:
                        continue

                    geom = (cols.get("geometry") or [None])[i]
                    if geom is None:
                        continue
                    # pyarrow devuelve geometría como dict {'x':..,'y':..} o WKB según versión
                    if isinstance(geom, dict):
                        lng, lat = geom.get("x"), geom.get("y")
                    else:
                        # fallback: bytes WKB punto -> parseo simple
                        import struct
                        b = bytes(geom)
                        lng, lat = struct.unpack("<dd", b[5:21])
                    if lat is None or lng is None:
                        continue

                    source_id = (cols.get("id") or [None])[i]
                    if source_id and source_id in existing_source_ids:
                        skipped += 1
                        continue

                    key = (name.lower(), int(lat * 100000), int(lng * 100000))
                    if key in existing_keys:
                        skipped += 1
                        continue

                    categories = (cols.get("categories") or [None])[i] or {}
                    primary_cat = categories.get("primary")
                    category = map_category(primary_cat)

                    addresses = (cols.get("addresses") or [None])[i] or []
                    addr0 = addresses[0] if addresses else {}
                    address_parts = [
                        addr0.get("freeform") or "",
                        addr0.get("address") or "",
                    ]
                    address = " ".join(p for p in address_parts if p).strip()
                    district = addr0.get("locality") or addr0.get("region") or "Lima"
                    if not address:
                        address = f"{district}, Lima"

                    phones = (cols.get("phones") or [None])[i] or []
                    websites = (cols.get("websites") or [None])[i] or []

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
                            str(district)[:255],
                            address[:255],
                            f"{name} en {district}, Lima. Importado desde Overture Maps.",
                            normalize_phone(phones[0] if phones else None),
                            normalize_website(websites[0] if websites else None),
                            None,
                            float(lat),
                            float(lng),
                            None,
                            "overture",
                            source_id,
                        ),
                    )
                    inserted += 1
                    existing_keys.add(key)
                    if source_id:
                        existing_source_ids.add(source_id)

                if inserted >= args.limit:
                    break

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
