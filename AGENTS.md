# AGENTS.md — guía para agentes en este repo

## Proyecto

LimaCentro: directorio de negocios de Lima, Perú. Mapa interactivo,
búsqueda por distrito/categoría, fichas SEO públicas por negocio.

## Stack

- Runtime/package manager: **Bun** (>= 1.4). No usar npm/node.
- Framework: **TanStack Start** (React 19 + Vite + SSR). File-based routing
  en `src/routes/`.
- DB: PostgreSQL (Neon) + **Prisma 7** con `@prisma/adapter-neon`.
  Cliente generado en `src/generated/prisma/` (gitignored).
- Auth: Google Identity Services → cookie JWT propia (`jose`, httpOnly).
  No hay NextAuth ni passwords.
- Mapa: MapLibre GL + OpenFreeMap (`src/components/ui/map.tsx`).
- Tests: **Vitest** + Testing Library (`tests/`).

## Comandos

```bash
bun install
bun run dev          # dev server :3000
bun run build        # build → dist/
bun run start        # servidor prod Bun (server.ts)
bun test             # vitest run
bun run typecheck    # tsc --noEmit
bun run db:generate  # prisma generate
bun run db:migrate   # prisma migrate deploy
```

Verificación estándar tras cambios: `bun run typecheck && bun test && bun run build`.

## Convenciones

- Imports con alias `@/` → `src/`.
- Rutas API en `src/routes/api/` con `server.handlers`; validar con zod
  (`src/lib/validation.ts`) y auth vía `src/lib/session.ts`.
- Endpoints públicos: pasar por `rateLimit` (ver `src/routes/api/`).
- Componentes React funcionales, Tailwind 4. Sin comentarios salvo que se pidan.
- Tests DOM: jsdom (default). Tests que usen `jose`/crypto:
  pragma `// @vitest-environment node`.

## Datos

Scripts Python en `scripts/` (psycopg2). Tres pipelines con dedup por
`(source, source_id)`:

```bash
bun run import:overture   # Overture Maps (abierto, recomendado)
bun run import:osm        # OpenStreetMap/Overpass
bun run import:gmaps      # CSV de gosom/google-maps-scraper — ver scripts/SCRAPING.md
```

## Seguridad

- `.env` gitignored; solo `.env.example` con placeholders.
- El historial de git fue reescrito para eliminar secretos, pero los valores
  antiguos deben considerarse comprometidos (rotar en Neon/Google/Stack/SMTP).
- Nunca loguear ni exponer secretos en endpoints; `VITE_*` es público.

## graft

Este repo está indexado por graft (`/graft/`, gitignored). Preferir las
tools de graft sobre grep/read para exploración; si el grafo está stale,
`graft build`.
