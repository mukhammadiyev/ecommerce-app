# Frontend Development Guide

Use this guide while working on the UI before the backend is ready.

## Current setup

- **Stack:** React 19, Vite 8, Tailwind CSS 4
- **Routing:** React Router in `client/src/routes/`
- **API layer:** `client/src/services/`
- **Mock data:** `client/src/mocks/`
- **Env config:** `client/.env`

## Run locally

```bash
cd client
npm install
npm run dev
```

Or from the repo root:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Mock mode (default)

`client/.env`:

```env
VITE_USE_MOCK=true
VITE_API_URL=http://localhost:3001/api
```

With mock mode on:

- `productService` returns data from `client/src/mocks/products.js`
- `authService` stores a fake token in `localStorage`
- No backend is required

## Switch to real API later

When the backend dev is ready:

1. Set `VITE_USE_MOCK=false` in `client/.env`
2. Confirm `VITE_API_URL` matches the backend base URL
3. Align service methods with `docs/API.md` (backend team fills this in)
4. Test auth, products, cart, and checkout flows

Vite already proxies `/api` to `http://localhost:3001` in dev.

## What to build first

Recommended order:

1. **Layout** — `components/layout/`, `layouts/PublicLayout.jsx`
2. **Public pages** — Home, Products, ProductDetails, Cart
3. **Auth UI** — Login, Register (`pages/auth/`)
4. **Account area** — `pages/account/` behind `ProtectedRoute`
5. **Admin area** — `pages/admin/` behind `AdminRoute`

Use `PlaceholderPage` for routes that are not built yet.

## File map

| Area | Folder |
|------|--------|
| Pages | `client/src/pages/` |
| Reusable UI | `client/src/components/` |
| API calls | `client/src/services/` |
| State | `client/src/store/` |
| Shared hooks | `client/src/hooks/` |
| Route guards | `client/src/routes/` |

## Deploy frontend only

```bash
npm run docker:frontend
```

Frontend is served at `http://localhost:8080`.

Backend and Redis services are commented out in `docker-compose.yml` until the backend team implements them.

## Working with the backend dev

1. Agree on API contracts in `docs/API.md`
2. Backend implements routes under `server/src/routes/`
3. Frontend switches off mock mode
4. Full stack deploy uses the complete `docker-compose.yml`

## Notes

- Keep the full repo structure — do not delete `server/` or `docker/` folders
- Add new mock data in `client/src/mocks/` as you build more pages
- Each `*Service.js` should support both mock and real API paths
