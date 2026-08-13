# Relay CRM

A small full-stack CRM for managing **contacts** and a **deals pipeline**, built to be
easy to run end-to-end in a development environment.

- **Client** — React + TypeScript + Vite + Tailwind CSS (`client/`)
- **Server** — Node.js + Express REST API backed by SQLite via `better-sqlite3` (`server/`)
- **Workspaces** — npm workspaces tie the two packages together at the repo root

## Prerequisites

- Node.js `>= 20` (developed on Node 22)
- npm `>= 10`
- A C/C++ toolchain (`gcc`, `g++`, `make`, `python3`) for the native `better-sqlite3` build

## Getting started

```bash
npm ci        # install all workspace dependencies (server + client)
npm run dev   # start the API (:3001) and the Vite dev server (:5173) together
```

Then open http://localhost:5173. The Vite dev server proxies `/api/*` to the API on
port `3001`, and the SQLite database is created and seeded automatically on first run
at `server/data/crm.db`.

### Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run server + client together (used by the dev environment) |
| `npm run dev:server` | Run only the Express API with file watching |
| `npm run dev:client` | Run only the Vite dev server |
| `npm run build` | Type-check and build the client for production |
| `npm run start` | Run the API in production mode (also serves `client/dist` if built) |
| `npm run lint` | Type-check the client with `tsc --noEmit` |

## API overview

Base URL: `/api`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `GET` | `/summary` | Dashboard counts + pipeline value |
| `GET`/`POST` | `/contacts` | List / create contacts |
| `GET`/`PUT`/`DELETE` | `/contacts/:id` | Read / update / delete a contact |
| `GET`/`POST` | `/deals` | List / create deals |
| `PUT`/`DELETE` | `/deals/:id` | Update / delete a deal |

## Cloud Agent environment

`.cursor/environment.json` configures the Cloud Agent dev environment:

- `install`: `npm ci` installs all workspace dependencies.
- `terminals`: `server` and `client` run the API and the Vite dev server.
- `ports`: `5173` (client) and `3001` (API) are exposed.
