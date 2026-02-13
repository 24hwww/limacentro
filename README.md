# LimaCentro

## Requisitos

- Node.js `20.19+`
- npm `10+`

## Desarrollo local

1. Instala dependencias:
   `npm install`
2. Crea tu archivo local de variables:
   `cp .env.example .env.local`
3. Completa los valores reales en `.env.local` (no subir credenciales al repo).
4. Ejecuta:
   `npm run dev`

## Scripts

- `npm run dev` - servidor local
- `npm run build` - build de producción
- `npm run start` - ejecutar build
- `npm run lint` - linting
- `npm test` - tests

## Carga inicial de negocios (OSM)

1. Crea entorno Python:
   `python3 -m venv .venv && .venv/bin/pip install psycopg2-binary requests`
2. Ejecuta importación:
   `DATABASE_URL="..." .venv/bin/python scripts/import_lima_businesses_osm.py --limit 250`

## SEO técnico

- `robots.txt`: `/robots.txt`
- `sitemap.xml`: `/sitemap.xml`
- Fichas indexables: `/negocio/:id`

## Notas de seguridad

- `.env` y `.env.local` están ignorados por git.
- Usa secretos distintos para cada entorno.
- Rota cualquier secreto que se haya expuesto previamente.
