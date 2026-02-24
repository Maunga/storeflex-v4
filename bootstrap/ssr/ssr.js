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
      /* @__PURE__ */ Object.assign({ "./Pages/Auth/ForgotPassword.tsx": () => import("./assets/ForgotPassword-DghwoXVK.js"), "./Pages/Auth/Login.tsx": () => import("./assets/Login-CKzdgIkH.js"), "./Pages/Auth/Register.tsx": () => import("./assets/Register-DnRTAzLg.js"), "./Pages/Checkout.tsx": () => import("./assets/Checkout-Bcr88o9k.js"), "./Pages/CheckoutSuccess.tsx": () => import("./assets/CheckoutSuccess-ptkF0Q7U.js"), "./Pages/Dashboard.tsx": () => import("./assets/Dashboard-CyVUT-jR.js"), "./Pages/Orders.tsx": () => import("./assets/Orders-Bacn39iw.js"), "./Pages/Product.tsx": () => import("./assets/Product-nicPgspP.js"), "./Pages/Profile.tsx": () => import("./assets/Profile-B2UNc_rF.js"), "./Pages/SearchResults.tsx": () => import("./assets/SearchResults-Bik2Yv5i.js"), "./Pages/Terms.tsx": () => import("./assets/Terms-2HvfluC5.js"), "./Pages/Welcome.tsx": () => import("./assets/Welcome-BKTcReqC.js") })
    ),
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
