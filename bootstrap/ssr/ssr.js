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
      /* @__PURE__ */ Object.assign({ "./Pages/Auth/Login.tsx": () => import("./assets/Login-B7IJkoBB.js"), "./Pages/Auth/Register.tsx": () => import("./assets/Register-CH5ibyag.js"), "./Pages/Dashboard.tsx": () => import("./assets/Dashboard-CkX9XKvM.js"), "./Pages/Product.tsx": () => import("./assets/Product-jVYts9wR.js"), "./Pages/SearchResults.tsx": () => import("./assets/SearchResults-BeRV1HdV.js"), "./Pages/Terms.tsx": () => import("./assets/Terms-D9ZGLYql.js"), "./Pages/Welcome.tsx": () => import("./assets/Welcome-CMr4zGVp.js") })
    ),
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
