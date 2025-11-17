## Modelia AI Studio

Full-stack demo that simulates a fashion image generation studio with secure auth, file uploads, retryable generation flows, and recent history. Built with Express + SQLite on the backend and React + Vite + Tailwind on the frontend. Automated tests (Jest + Supertest, Vitest + React Testing Library) and linting guard behavior.

### Features
- JWT signup/login with bcrypt hashing and Zod validation.
- Upload up to 10 MB JPEG/PNG, preview locally, and simulate generation with 20% overload responses, abort + retry (3x).
- Persist last five generations per user; selecting any restores the workspace.
- Accessible, responsive UI with session persistence, dark mode toggle, and friendly status banners.
- OpenAPI spec at `apps/server/openapi.yaml`.

### Getting Started
```bash
# Install workspace deps
npm install

# Start backend + frontend in parallel
npm run dev

# Or run individually
npm --workspace apps/server run dev
npm --workspace apps/web run dev
```

Environment variables (optional) for the API: `PORT`, `JWT_SECRET`, `DB_PATH`, `UPLOADS_DIR`. Defaults run locally on port `4000`.

### Testing & Linting
```bash
# Run all tests
npm run test

# Lint both workspaces
npm run lint
```

### API Overview
Refer to `apps/server/openapi.yaml` for full schema. Key endpoints:
- `POST /auth/signup` · `POST /auth/login`
- `POST /generations` (multipart, auth required, 20% overload simulation)
- `GET /generations?limit=5`

### Notes
- Uploaded/generated files are stored under `uploads/` and served statically via `/uploads/*`.
- Frontend expects `VITE_API_URL` env (defaults to `http://localhost:4000`).

