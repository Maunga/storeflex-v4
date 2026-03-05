import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { S as SidebarBookmarks, B as BookmarksDrawer } from "./SidebarBookmarks-DlxMoBaN.js";
import { S as SEO } from "./SEO-_RAcpsXN.js";
import axios from "axios";
function Terms({ auth }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  useEffect(() => {
    if (auth?.user) {
      axios.get("/bookmarks").then((res) => setBookmarks(res.data)).catch(() => {
      });
    }
  }, [auth?.user]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Terms & Conditions",
        description: "Read Storeflex terms and conditions for dropshipping services from Dubai to Zimbabwe. Learn about our shipping policies, returns, and customer service guarantees.",
        keywords: "terms and conditions, shipping policy Zimbabwe, dropshipping terms, Storeflex policies, Dubai to Zimbabwe shipping terms"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950", children: [
      auth?.user && /* @__PURE__ */ jsx(SidebarBookmarks, { user: auth.user, bookmarks }),
      auth?.user && /* @__PURE__ */ jsx(
        BookmarksDrawer,
        {
          user: auth.user,
          bookmarks,
          isOpen: isBookmarksOpen,
          onClose: () => setIsBookmarksOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-h-screen", children: [
        /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            auth?.user && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setIsBookmarksOpen(true),
                className: "lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors",
                "aria-label": "Open menu",
                children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white", children: /* @__PURE__ */ jsx("img", { src: "/images/logo.png", alt: "Storeflex", className: "h-8 w-auto" }) })
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-3", children: auth?.user ? /* @__PURE__ */ jsx(
            Link,
            {
              href: "/dashboard",
              className: "px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors",
              children: "Dashboard"
            }
          ) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/login",
                className: "px-4 py-2 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors",
                children: "Log in"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/register",
                className: "px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors",
                children: "Get Started"
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "flex-1 px-4 sm:px-6 py-8 sm:py-12", children: /* @__PURE__ */ jsxs("article", { className: "max-w-3xl mx-auto", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2", children: "Terms & Conditions" }),
          /* @__PURE__ */ jsx("div", { className: "h-1 w-16 bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-500 rounded-full mb-8" }),
          /* @__PURE__ */ jsx("section", { className: "mb-10", children: /* @__PURE__ */ jsx("p", { className: "text-base leading-relaxed text-neutral-600 dark:text-neutral-400", children: "Welcome to Storeflex, valued shoppers! 👋 We're here to ensure a smooth and transparent shopping experience. Below is a concise guide to our pricing and delivery policies." }) }),
          /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
            /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4", children: [
              /* @__PURE__ */ jsx("span", { children: "🏷️" }),
              " Pricing Policy Quick Facts"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium text-neutral-900 dark:text-white mb-1", children: "Check Before Purchasing 💲" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed", children: "Prices on Amazon can change due to various factors. Verify the current price before buying." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium text-neutral-900 dark:text-white mb-1", children: "Post-Payment Price Changes 🔄" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed", children: "Be aware that prices may shift even after your payment is complete." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
            /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4", children: [
              /* @__PURE__ */ jsx("span", { children: "🚚" }),
              " Delivery Insights"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium text-neutral-900 dark:text-white mb-1", children: "Allow 3+ Days to Our Warehouse ⏱️" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed", children: "Factor in a minimum of three days for items to reach our warehouse when planning your purchase." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium text-neutral-900 dark:text-white mb-1", children: "We Strive for Fast Delivery 📦" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed", children: "We understand timely delivery is crucial and do our best to expedite your order." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
            /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4", children: [
              /* @__PURE__ */ jsx("span", { children: "🛒" }),
              " Smooth Shopping Tips"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-neutral-900 dark:text-white mb-1", children: "Prompt Payment for Swift Processing ✔️" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed", children: "Ensure a faster order process by completing your payment promptly." })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
            /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white mb-4", children: [
              /* @__PURE__ */ jsx("span", { children: "📞" }),
              " Support is Just a Click Away"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-neutral-900 dark:text-white mb-1", children: "Questions? Contact Us! 🤝" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed", children: "Our customer care team is ready to assist 24/7. Reach out anytime!" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "bg-gradient-to-br from-purple-500/5 via-pink-400/5 to-yellow-500/5 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3", children: "Thank you for choosing Storeflex. Happy shopping, and here's to fast arrivals!" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-neutral-900 dark:text-white", children: "Warmly, The Storeflex Team 🧡" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("footer", { className: "px-6 py-4 text-center text-[13px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("p", { children: [
          "Storeflex by",
          " ",
          /* @__PURE__ */ jsx("a", { href: "https://dxbrunners.com", target: "_blank", rel: "noopener noreferrer", className: "text-[#a855f7] hover:underline", children: "DXB Runners" }),
          " ",
          "· Your trusted dropshipping partner for Amazon.ae products",
          " ",
          "·",
          " ",
          /* @__PURE__ */ jsx(Link, { href: "/terms", className: "text-[#a855f7] hover:underline", children: "Terms & Conditions" })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Terms as default
};
