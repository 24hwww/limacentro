#!/usr/bin/env python3
"""
Genera el archivo de queries para gosom/google-maps-scraper:
una línea por combinación término × distrito de Lima.

Uso:
  python3 scripts/generate_gmaps_queries.py > scripts/gmaps_queries.txt
  python3 scripts/generate_gmaps_queries.py --terms "restaurantes,hotels" --districts "Miraflores,Lima"
"""

import argparse

TERMS = [
    "restaurantes",
    "cafés",
    "hoteles",
    "hostales",
    "farmacias",
    "clínicas",
    "dentistas",
    "gimnasios",
    "salones de belleza",
    "barberías",
    "bancos",
    "tiendas de ropa",
    "supermercados",
    "bodegas",
    "ferreterías",
    "librerías",
    "academias",
    "colegios",
    "agencias de viajes",
    "veterinarias",
    "lavanderías",
    "talleres mecánicos",
    "panaderías",
    "pollerías",
    "pizzerías",
    "chifas",
    "cevicherías",
    "bares",
    "discotecas",
    "centros comerciales",
]

DISTRICTS = [
    "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos",
    "Cieneguilla", "Comas", "El Agustín", "Independencia", "Jesús María",
    "La Molina", "La Victoria", "Lima", "Lince", "Los Olivos", "Lurigancho",
    "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana",
    "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac",
    "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho",
    "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel",
    "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco",
    "Surquillo", "Villa El Salvador", "Villa María del Triunfo",
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--terms", type=str, default=",".join(TERMS))
    parser.add_argument("--districts", type=str, default=",".join(DISTRICTS))
    args = parser.parse_args()

    terms = [t.strip() for t in args.terms.split(",") if t.strip()]
    districts = [d.strip() for d in args.districts.split(",") if d.strip()]

    for term in terms:
        for district in districts:
            print(f"{term} en {district}, Lima, Perú")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
