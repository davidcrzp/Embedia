/// <reference path="../.astro/types.d.ts" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/vanillajs" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_BACKEND_URL?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_MP_PUBLIC_KEY: string;
  readonly PUBLIC_REALTIME_URL?: string;
  readonly BACKEND_URL?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }
declare namespace App { interface Locals { usuario: { id: string; nombre: string; email: string; rol: 'ADMIN' | 'CLIENTE' } | null; } }
