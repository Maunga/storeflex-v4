import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { S as SEO } from "./SEO-_RAcpsXN.js";
import axios from "axios";
const getGreeting = () => {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
function Dashboard({ auth }) {
  const [greeting, setGreeting] = useState("Welcome");
  const [bookmarks, setBookmarks] = useState([]);
  useEffect(() => {
    setGreeting(getGreeting());
    if (auth?.user) {
      axios.get("/bookmarks").then((res) => setBookmarks(res.data)).catch(() => {
      });
    }
  }, [auth?.user]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Dashboard",
        description: "Manage your Storeflex account. Track orders, view bookmarks, and shop premium products from Dubai delivered to Zimbabwe.",
        keywords: "dashboard, account, orders, bookmarks, Storeflex Zimbabwe"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950", children: [
      /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]", title: auth?.user?.email, children: auth?.user?.email }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/logout",
              method: "post",
              as: "button",
              className: "text-xs text-neutral-500 hover:text-[#86efac] dark:text-neutral-400 dark:hover:text-[#86efac] transition-colors",
              children: "Log out"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3", children: "Bookmarks" }),
          bookmarks.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: bookmarks.map((bookmark) => /* @__PURE__ */ jsxs(
            Link,
            {
              href: bookmark.asin ? `/product/${bookmark.asin}` : "#",
              className: "flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: bookmark.img_url,
                    alt: "",
                    className: "w-10 h-10 object-contain rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-tight", children: bookmark.title }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-emerald-600 dark:text-[#86efac] mt-0.5", children: [
                    "$",
                    bookmark.price
                  ] })
                ] })
              ]
            },
            bookmark.id
          )) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-neutral-400 dark:text-neutral-500", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-10 h-10 mx-auto mb-2 opacity-50", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: /* @__PURE__ */ jsx("path", { d: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs", children: "No bookmarks yet" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-h-screen", children: [
        /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white", children: /* @__PURE__ */ jsx("img", { src: "/images/logo.png", alt: "Storeflex", className: "h-8 w-auto" }) }),
          /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/profile",
                className: "px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors",
                children: "Profile"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/logout",
                method: "post",
                as: "button",
                className: "px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors",
                children: "Log out"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 sm:p-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white mb-4 sm:mb-6", children: [
            greeting,
            auth?.user?.name ? `, ${auth.user.name}` : "",
            "!"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-3 sm:mb-4", children: "Quick Actions" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: "/",
                  className: "flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#86efac]/10 flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-[#86efac]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
                      /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: "New Search" }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Find products on Amazon.ae" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: "/orders",
                  className: "flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-emerald-600 dark:text-[#86efac]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("path", { d: "M9 3h6l1 2h4v16H4V5h4l1-2z" }),
                      /* @__PURE__ */ jsx("path", { d: "M8 10h8" }),
                      /* @__PURE__ */ jsx("path", { d: "M8 14h8" }),
                      /* @__PURE__ */ jsx("path", { d: "M8 18h5" })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: "Order History" }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Review past orders" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: "/profile",
                  className: "flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#a855f7]/10 flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-[#a855f7]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
                      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "7", r: "4" })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: "Profile Settings" }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Manage your account" })
                    ] })
                  ]
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("footer", { className: "px-6 py-4 text-center text-[13px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("p", { children: [
          "Storeflex by",
          " ",
          /* @__PURE__ */ jsx("a", { href: "https://dxbrunners.com", target: "_blank", rel: "noopener noreferrer", className: "text-[#a855f7] hover:underline", children: "DXB Runners" }),
          " ",
          "· Your trusted dropshipping partner for Amazon.ae products ·",
          " ",
          /* @__PURE__ */ jsx(Link, { href: "/terms", className: "text-[#a855f7] hover:underline", children: "Terms & Conditions" })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as default
};
