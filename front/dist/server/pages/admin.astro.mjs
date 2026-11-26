import { a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_O3v_sucX.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_DvSBpePx.mjs';
import { $ as $$TopBar, a as $$Footer } from '../chunks/Footer__yfOj7l4.mjs';
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Admin \u2014 Embedia", "noindex": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TopBar", $$TopBar, {})} ${maybeRenderHead()}<main id="main" class="mx-auto max-w-[1400px] px-6 pt-10"> ${renderComponent($$result2, "AdminApp", null, { "client:only": "preact", "client:component-hydration": "only", "client:component-path": "/home/orange/Projects/PW2/PWA/front/src/islands/AdminApp.tsx", "client:component-export": "default" })} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
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
