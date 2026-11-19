# Embedia — Backend

## Cambios de esta versión
1. **`src/index.ts`**: `hostname: 0.0.0.0` explícito (Railway/Render/Docker) + `compress()`.
2. **`railway.json`**: `sleepApplication: false`, `healthcheckPath: /api/health`.
3. **`.env.example`**: documentado deployment + `JWT_EXPIRES_IN_MCP` (token de larga vida para MCP).
4. **`firmarToken` acepta `expiresIn` override** para emitir tokens de 1 año al MCP.
5. Sin cambios de schema, resolvers, checkout ni SSE.

## Endpoints
- GET  /api/health
- POST /auth/login · /auth/register · /auth/logout · GET /auth/me
- POST /graphql  (queries/mutations · subscription `pedidoCreado` por SSE, solo ADMIN)
- POST /api/checkout/process-payment · /api/checkout/process-oxxo
- POST /upload · GET /uploads/*  (cache inmutable: `max-age=31536000`)

## Deploy a Railway
1. **Plugin Postgres**: Añadir al proyecto → inyecta `DATABASE_URL` en todos los servicios.
2. **Servicio backend**: New Service → Deploy from GitHub. Base: `p26/back`.
   - Nixpacks detecta Bun automáticamente.
   - `railway.json` ejecuta: `bun install && bun run db:ensure && bun run start`.
3. **Environment variables** en Railway → Variables:
   - `JWT_SECRET = <32+ chars aleatorios>`
   - `MP_ACCESS_TOKEN = TEST-...` (o APP_USR-... en prod)
   - `FRONTEND_ORIGIN = https://embedia.netlify.app`  ← dominio Netlify exacto
   - `COOKIE_SECURE = true`
   - `COOKIE_SAMESITE = None`
   - `PORT` — Railway lo inyecta, no definir manualmente
4. Verifica `https://<tu-servicio>.up.railway.app/api/health` → `{ backend: "ok" }`.

## Local
```bash
docker compose up -d db
bun install
bun run db:reset   # o db:ensure
bun run dev        # :4000
