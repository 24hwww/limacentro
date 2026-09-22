# LimaCentro

Directorio de negocios de Lima, Perú. Mapa interactivo, búsqueda por
distrito/categoría, fichas SEO públicas por negocio.

## Stack

- **Runtime:** Bun (>= 1.4)
- **Framework:** TanStack Start (React 19 + Vite + SSR)
- **DB:** PostgreSQL (Neon) + Prisma 7 (driver adapter `@prisma/adapter-neon`)
- **Auth:** Google Identity Services → cookie de sesión JWT (jose, httpOnly)
- **Mapa:** MapLibre GL + tiles vectoriales de OpenFreeMap
- **Tests:** Vitest + Testing Library

## Desarrollo local

```bash
bun install
cp .env.example .env    # completa los valores
bunx prisma generate
bunx prisma migrate deploy
bun run dev             # http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---|---|
| `bun run dev` | Dev server con HMR |
| `bun run build` | Build de producción → `dist/` |
| `bun run start` | Servidor de producción Bun (`server.ts`) |
| `bun test` | Vitest |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run db:generate` / `db:migrate` | Prisma generate / migrate deploy |

## Producción

```bash
bun run build && bun run start   # sirve en :3000
# o con Docker:
docker build -t limacentro . && docker run -p 3000:3000 --env-file .env limacentro
```

`server.ts` sirve `dist/client` con preload + gzip/etag y delega SSR a
`dist/server/server.js`. Deployable en cualquier host con Bun (VPS, Railway,
Fly.io). Si necesitas Netlify/Vercel, añade el plugin `nitro` de
`nitro/vite` con el preset correspondiente (correría en Node).

## Carga de datos de negocios

Tres pipelines, con dedup por `(source, source_id)` y `(nombre, coords)`:

| Fuente | Script | Notas |
|---|---|---|
| Overture Maps | `bun run import:overture` | Abierto, gratis, sin límites |
| OpenStreetMap | `bun run import:osm` | Overpass API |
| Google Maps | `bun run import:gmaps` | Ver `scripts/SCRAPING.md` — **viola ToS de Google** |

Detalles completos en [scripts/SCRAPING.md](scripts/SCRAPING.md).

## Estructura

```
src/
  routes/            file-based routing (TanStack Router)
    api/             endpoints server (server.handlers)
    negocio/$id.tsx  ficha SEO con loader SSR + JSON-LD
  components/        UI (map.tsx = wrapper MapLibre estilo mapcn)
  contexts/          AuthContext (sesión por cookie)
  lib/               db, auth (jose), session, validation (zod), utils
  services/          businessService (Prisma), api client, geocoding
  generated/prisma/  cliente Prisma generado (gitignored)
scripts/             importadores de datos (Python)
server.ts            servidor de producción Bun
```

## Notas de seguridad

- `.env` nunca se commitea. Usa secretos distintos por entorno.
- El historial de git fue reescrito para eliminar un `.env` real commiteado
  por error. **Los secretos antiguos deben considerarse comprometidos y
  rotados igual** (Neon, Google Cloud, Stack, SMTP): clones, forks y caches
  de GitHub pueden retenerlos.
- Variables `VITE_*` son públicas por diseño; nunca pongas secretos ahí.
