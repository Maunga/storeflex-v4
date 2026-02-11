import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
function SearchResults({ auth, results, query }) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(false);
  const handleNewSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    router.get("/search", { q: searchQuery.trim() }, {
      onFinish: () => setLoading(false)
    });
  };
  const handleProductClick = (item) => {
    if (item.asin) {
      setLoading(true);
      router.visit(`/product/${item.asin}`, {
        onFinish: () => setLoading(false)
      });
      return;
    }
    const amazonUrl = item.url?.startsWith("http") ? item.url : `https://www.amazon.ae${item.url ?? ""}`;
    setLoading(true);
    router.post("/search", { query: amazonUrl }, {
      onFinish: () => setLoading(false)
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Search: ${query}` }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950", children: [
      auth?.user && /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]", title: auth.user.email, children: auth.user.email }),
        /* @__PURE__ */ jsx(Link, { href: "/logout", method: "post", as: "button", className: "text-xs text-neutral-500 hover:text-[#86efac] dark:text-neutral-400 dark:hover:text-pink-400 transition-colors", children: "Log out" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-h-screen", children: [
        /* @__PURE__ */ jsx("header", { className: "bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-4 sm:px-6 py-3", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center gap-2 flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-500 flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-white", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsx("path", { d: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" }),
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
            /* @__PURE__ */ jsx("path", { d: "M16 10a4 4 0 0 1-8 0" })
          ] }) }) }),
          /* @__PURE__ */ jsx("form", { onSubmit: handleNewSearch, className: "flex-1 max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                placeholder: "Search for products...",
                className: "w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all"
              }
            ),
            /* @__PURE__ */ jsxs("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
              /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
            ] })
          ] }) })
        ] }) }),
        loading && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-white/60 dark:bg-neutral-950/60 z-50 flex items-center justify-center backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-neutral-200 dark:border-neutral-700 border-t-[#86efac] rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Fetching product details..." })
        ] }) }),
        /* @__PURE__ */ jsx("main", { className: "flex-1 px-4 sm:px-6 py-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto animate-page-enter", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-neutral-700 dark:text-neutral-300", children: results.length }),
            ' results for "',
            /* @__PURE__ */ jsx("span", { className: "font-medium text-neutral-700 dark:text-neutral-300", children: query }),
            '"'
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: results.map((item, index) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleProductClick(item),
              className: "group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden text-left transition-all hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-600 hover:-translate-y-0.5",
              style: { animationDelay: `${index * 50}ms` },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "relative aspect-square bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center p-4 overflow-hidden", children: [
                  item.url_image ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: item.url_image,
                      alt: item.title,
                      className: "max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    }
                  ) : /* @__PURE__ */ jsxs("svg", { className: "w-16 h-16 text-neutral-300 dark:text-neutral-600", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1", children: [
                    /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
                    /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
                    /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
                  ] }),
                  item.is_prime && /* @__PURE__ */ jsx("span", { className: "absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-400 rounded", children: "Prime" }),
                  item.best_seller && /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/40 dark:text-orange-400 rounded", children: "Best Seller" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-neutral-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#86efac] transition-colors", children: item.title }),
                  item.rating != null && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsx("svg", { className: `w-3.5 h-3.5 ${s <= Math.round(item.rating) ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}`, viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, s)) }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-neutral-400", children: [
                      "(",
                      item.reviews_count?.toLocaleString() ?? 0,
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
                    item.price != null && /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: [
                      item.currency ?? "AED",
                      " ",
                      item.price.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    ] }),
                    item.price_strikethrough != null && item.price_strikethrough > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-neutral-400 line-through", children: [
                      item.currency ?? "AED",
                      " ",
                      item.price_strikethrough
                    ] })
                  ] }),
                  item.shipping_information && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-neutral-400 dark:text-neutral-500 leading-snug line-clamp-1", children: item.shipping_information })
                ] })
              ]
            },
            item.asin ?? index
          )) })
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
  SearchResults as default
};
