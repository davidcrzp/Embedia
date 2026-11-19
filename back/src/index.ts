import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';
import { serveStatic } from 'hono/bun';
import { yoga } from './http/graphql';
import { authRoutes } from './http/auth';
import { uploadRoutes } from './http/upload';
import { checkoutRoutes } from './http/checkout';

const app = new Hono();

// [CHANGED] Compresión en el propio servidor (para preview local; en Railway el proxy
// de borde ya comprime, pero esto no molesta y ayuda a `/api/health`).
app.use('*', compress());

const FRONTEND = (process.env.FRONTEND_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean);
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    if (FRONTEND.length === 0) return origin;
    return FRONTEND.includes(origin) ? origin : null;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposeHeaders: ['Content-Type'],
}));

app.get('/api/health', (c) =>
  c.json({
    backend: 'ok',
    mp: String(process.env.MP_ACCESS_TOKEN ?? '').startsWith('TEST-') ? 'sandbox' : 'prod',
    methods: ['tarjeta', 'oxxo'], endpoint: 'orders', geocoding: 'nominatim',
  }),
);

app.route('/auth', authRoutes);
app.all('/graphql', (c) => yoga.fetch(c.req.raw));
app.route('/api/checkout', checkoutRoutes);

app.use('/uploads/*', async (c, next) => {
  await next();
  if (!c.res.headers.get('Cache-Control')) {
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
  }
});
app.use('/uploads/*', serveStatic({ root: './' }));
app.route('/upload', uploadRoutes);

app.get('/', (c) => c.text('Embedia API — /graphql · /auth/* · /api/checkout/* · /api/health · /upload · /uploads/*'));

const port = Number(process.env.PORT ?? 4000);
// [CHANGED] host 0.0.0.0 explícito para Railway/Render/Docker.
// idleTimeout > 12s de Yoga para SSE.
const hostname = process.env.HOST ?? '0.0.0.0';

console.log(`🚀 Embedia backend http://${hostname}:${port}`);
console.log(`   Pagos: tarjeta (credit_card) · OXXO (ticket) — Orders API`);
console.log(`   Geocoding: Nominatim (lado cliente, vía autocomplete)`);
console.log(`   Health: http://${hostname}:${port}/api/health`);

export default { port, hostname, fetch: app.fetch, idleTimeout: 120 };
