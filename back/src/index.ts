import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { yoga } from './http/graphql';
import { authRoutes } from './http/auth';
import { uploadRoutes } from './http/upload';
import { checkoutRoutes } from './http/checkout';

const app = new Hono();

const FRONTEND = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (FRONTEND.length === 0) return origin; // dev
      return FRONTEND.includes(origin) ? origin : null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposeHeaders: ['Content-Type'],
  }),
);

app.get('/api/health', (c) =>
  c.json({
    backend: 'ok',
    mp: String(process.env.MP_ACCESS_TOKEN ?? '').startsWith('TEST-') ? 'sandbox' : 'prod',
    methods: ['tarjeta', 'oxxo'],
    geocoding: 'nominatim',
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
const hostname = process.env.HOST ?? '0.0.0.0';

console.log(`🚀 Embedia backend http://${hostname}:${port}`);
export default { port, hostname, fetch: app.fetch, idleTimeout: 120 };
