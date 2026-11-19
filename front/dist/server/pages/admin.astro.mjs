import { c as createAstro, a as createComponent, m as maybeRenderHead, r as renderTemplate, d as renderComponent } from '../chunks/astro/server_O3v_sucX.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_BFlhnPro.mjs';
import { $ as $$TopBar, a as $$Footer } from '../chunks/Footer_BKSbCEz3.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro("https://embedia.netlify.app");
const $$AdminShell = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$AdminShell;
  const { nombre, rol } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<header class="border-b border-border pb-4"> <p class="mb-2 font-mono text-label uppercase text-primary">● Panel administrativo</p> <div class="flex flex-wrap items-end justify-between gap-4"> <h1 class="text-heading font-bold">Dashboard</h1> <span class="font-mono text-xs text-muted">${nombre} · <span class="text-primary">${rol}</span></span> </div> </header>`;
}, "/home/orange/Projects/PW2/PWA/front/src/components/AdminShell.astro", void 0);

const $$Astro = createAstro("https://embedia.netlify.app");
const prerender = false;
const $$Admin = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Admin;
  const usuario = Astro2.locals.usuario;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Admin \u2014 Embedia", "noindex": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TopBar", $$TopBar, {})} ${maybeRenderHead()}<main id="main" class="mx-auto max-w-[1400px] px-6 pt-10">${renderComponent($$result2, "AdminShell", $$AdminShell, { "nombre": usuario.nombre, "rol": usuario.rol })}${renderComponent($$result2, "AdminApp", null, { "client:only": "preact", "client:component-hydration": "only", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/AdminApp.tsx", "client:component-export": "default" })}</main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/orange/Projects/PW2/PWA/front/src/pages/admin.astro", void 0);

const $$file = "/home/orange/Projects/PW2/PWA/front/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
