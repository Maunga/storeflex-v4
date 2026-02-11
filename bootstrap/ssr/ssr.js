import { jsx } from "react/jsx-runtime";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
async function resolvePageComponent(path, pages) {
  for (const p of Array.isArray(path) ? path : [path]) {
    const page = pages[p];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
const appName = "StoreflexBE";
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(
      `./Pages/${name}.tsx`,
      /* @__PURE__ */ Object.assign({ "./Pages/Auth/Login.tsx": () => import("./assets/Login-CRZyWrkj.js"), "./Pages/Auth/Register.tsx": () => import("./assets/Register-fYcKh6-d.js"), "./Pages/Dashboard.tsx": () => import("./assets/Dashboard-BCRVNXPS.js"), "./Pages/Product.tsx": () => import("./assets/Product-uc2fiP6z.js"), "./Pages/SearchResults.tsx": () => import("./assets/SearchResults-3GNV_dvn.js"), "./Pages/Terms.tsx": () => import("./assets/Terms-CLT5EwKl.js"), "./Pages/Welcome.tsx": () => import("./assets/Welcome-Ck2emA2C.js") })
    ),
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
