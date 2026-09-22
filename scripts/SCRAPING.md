# Obtención de datos de negocios de Lima

Tres fuentes disponibles, ordenadas de menor a mayor fricción legal/técnica:

## 1. Overture Maps (recomendado — abierto y legal)

Dataset global de POIs bajo licencia CDLA-Permissive. Sin rate limits, sin
bloqueos, sin API key. Cobertura en Lima es buena (datos agregados de
Meta/Microsoft/OSM), aunque sin ratings ni reviews reales.

```bash
pip install overturemaps psycopg2-binary pyarrow
DATABASE_URL="..." python3 scripts/import_overture_places.py --limit 2000
```

Opciones: `--bbox`, `--min-confidence` (sube a 0.6–0.8 para menos ruido).

## 2. OpenStreetMap / Overpass (ya existente)

```bash
DATABASE_URL="..." python3 scripts/import_lima_businesses_osm.py --limit 250
```

## 3. Google Maps vía gosom/google-maps-scraper

> **Advertencia legal:** scrapear Google Maps **viola los Términos de Servicio
> de Google** (y potencialmente normas de protección de datos si extraes datos
> personales). Google puede bloquear IPs, y en Perú/UE hay implicancias
> contractuales reales. Úsalo solo si aceptas ese riesgo; para un producto
> comercial serio la vía compliant es la **Google Places API** (de pago) o
> datasets abiertos como Overture. Este script existe porque el proyecto lo
> pidió explícitamente.

La herramienta más madura y eficiente es
[gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper)
(MIT): ~120 lugares/minuto, rotación de proxies SOCKS5/HTTP, salida CSV/JSON/
Postgres, reanudación con `-resume`, y modo `-email` para enriquecer con
emails de los sitios web de los negocios.

### Flujo

```bash
# 1. Generar queries (término × distrito)
python3 scripts/generate_gmaps_queries.py > gmaps_queries.txt
# Para una corrida de prueba pequeña:
python3 scripts/generate_gmaps_queries.py \
  --terms "restaurantes,cevicherías" --districts "Miraflores,Lima" > gmaps_queries.txt

# 2. Scrapear con Docker (playwright incluido en la imagen)
mkdir -p gmaps-output
docker run -v gmaps-cache:/opt \
  -v "$PWD/gmaps_queries.txt:/queries.txt:ro" \
  -v "$PWD/gmaps-output:/out" \
  gosom/google-maps-scraper \
  -input /queries.txt \
  -results /out/results.csv \
  -depth 1 \
  -exit-on-inactivity 3m

# Opciones útiles:
#   -c 8                        concurrencia (sube riesgo de bloqueo)
#   -proxies "socks5://..."     rotación de proxies (recomendado >1k queries)
#   -resume -results ...        reanuda un scrape interrumpido
#   -email                      extrae emails de los websites

# 3. Importar a la DB
DATABASE_URL="..." python3 scripts/import_gmaps_csv.py gmaps-output/results.csv
```

### Anti-bloqueo

- Empieza con `-c 2`–`4`; sube solo si no hay errores.
- Para corridas grandes (>5k queries) usa `-proxies` o `-proxies-file`.
- `-exit-on-inactivity` evita cuelgues eternos.
- `-resume` permite retomar sin re-scrapear lo ya obtenido.
- Dedup automático por `source_id` (cid/data_id de Google) y nombre+coords.

## Deduplicación

Los tres importadores deduplican por `(source, source_id)` y por
`(lower(name), lat·1e5, lng·1e5)`. La columna `businesses.source` registra la
procedencia (`user`, `osm`, `overture`, `gmaps`).
