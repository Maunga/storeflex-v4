import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
function Product({ auth, product, identifier }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = product.images ?? [];
  const bulletPoints = product.bullet_points ? product.bullet_points.split("\n").filter(Boolean) : [];
  const categories = product.category?.[0]?.ladder?.map((c) => c.name) ?? [];
  const delivery = product.delivery ?? product.buybox?.[0]?.delivery_details ?? [];
  const seller = product.featured_merchant ?? product.buybox?.[0] ?? null;
  const reviews = product.reviews?.slice(0, 6) ?? [];
  const stars = product.rating_stars_distribution ?? [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: product.title ?? "Product" }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950", children: [
      auth?.user && /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]", title: auth.user.email, children: auth.user.email }),
        /* @__PURE__ */ jsx(Link, { href: "/logout", method: "post", as: "button", className: "text-xs text-neutral-500 hover:text-[#811753] dark:text-neutral-400 dark:hover:text-pink-400 transition-colors", children: "Log out" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-h-screen", children: [
        /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800", children: [
          /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-400 to-yellow-500 flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-white", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" }),
              /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
              /* @__PURE__ */ jsx("path", { d: "M16 10a4 4 0 0 1-8 0" })
            ] }) }),
            "Storeflex"
          ] }),
          /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors", children: [
            /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
              /* @__PURE__ */ jsx("polyline", { points: "12 19 5 12 12 5" })
            ] }),
            "New Search"
          ] })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "flex-1 px-4 sm:px-6 py-8 sm:py-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto animate-page-enter", children: [
          categories.length > 0 && /* @__PURE__ */ jsx("nav", { className: "flex flex-wrap items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mb-6", children: categories.map((cat, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            i > 0 && /* @__PURE__ */ jsx("span", { children: "/" }),
            /* @__PURE__ */ jsx("span", { className: "hover:text-neutral-600 dark:hover:text-neutral-300", children: cat })
          ] }, i)) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12", children: [
            /* @__PURE__ */ jsx("div", { className: "space-y-4", children: images.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "relative aspect-square bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex items-center justify-center p-6", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: images[selectedImage],
                    alt: product.title,
                    className: "max-w-full max-h-full object-contain"
                  }
                ),
                product.amazon_choice && /* @__PURE__ */ jsx("span", { className: "absolute top-4 left-4 px-2.5 py-1 text-xs font-semibold text-white bg-[#232F3E] rounded-md", children: "Amazon's Choice" }),
                product.discount_percentage && product.discount_percentage > 0 && /* @__PURE__ */ jsxs("span", { className: "absolute top-4 right-4 px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-md", children: [
                  "-",
                  product.discount_percentage,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: images.slice(0, 8).map((img, i) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSelectedImage(i),
                  className: `flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${selectedImage === i ? "border-[#811753] ring-2 ring-[#811753]/20" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"}`,
                  children: /* @__PURE__ */ jsx("img", { src: img, alt: "", className: "w-full h-full object-contain bg-white dark:bg-neutral-900 p-1" })
                },
                i
              )) })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              product.brand && /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#811753] uppercase tracking-wide", children: product.brand }),
              /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white leading-snug", children: product.title }),
              product.rating != null && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx("svg", { className: `w-5 h-5 ${star <= Math.round(product.rating) ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}`, viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, star)) }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: product.rating }),
                product.reviews_count != null && /* @__PURE__ */ jsxs("span", { className: "text-sm text-neutral-400 dark:text-neutral-500", children: [
                  "(",
                  product.reviews_count.toLocaleString(),
                  " reviews)"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3", children: [
                product.price != null && product.price > 0 && product.stock !== "Currently unavailable" ? /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-3 flex-wrap", children: [
                  product.dxb_price && /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-neutral-400 block mb-0.5", children: "DXB Runners Price" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-3xl font-bold text-[#811753]", children: [
                      "$",
                      product.dxb_price
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: product.dxb_price ? "ml-4" : "", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-neutral-400 block mb-0.5", children: "Amazon.ae" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xl font-semibold text-neutral-700 dark:text-neutral-300", children: [
                      product.currency ?? "AED",
                      " ",
                      product.price
                    ] })
                  ] }),
                  product.price_strikethrough != null && product.price_strikethrough > 0 && /* @__PURE__ */ jsxs("span", { className: "text-base text-neutral-400 line-through", children: [
                    product.currency ?? "AED",
                    " ",
                    product.price_strikethrough
                  ] })
                ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Price unavailable" }),
                product.is_prime_eligible && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md", children: "✓ Prime Eligible" }),
                product.stock && /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${product.stock === "In Stock" ? "text-emerald-600" : "text-red-500"}`, children: product.stock })
              ] }),
              delivery.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-700 dark:text-neutral-300", children: "Delivery" }),
                delivery.map((d, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-sm text-neutral-500 dark:text-neutral-400", children: [
                  /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                    /* @__PURE__ */ jsx("rect", { x: "1", y: "3", width: "15", height: "13" }),
                    /* @__PURE__ */ jsx("polygon", { points: "16 8 20 8 23 11 23 16 16 16 16 8" }),
                    /* @__PURE__ */ jsx("circle", { cx: "5.5", cy: "18.5", r: "2.5" }),
                    /* @__PURE__ */ jsx("circle", { cx: "18.5", cy: "18.5", r: "2.5" })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    /* @__PURE__ */ jsx("strong", { className: "text-neutral-700 dark:text-neutral-200", children: d.type }),
                    " — ",
                    d.date?.by
                  ] })
                ] }, i))
              ] }),
              bulletPoints.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-700 dark:text-neutral-300", children: "About this item" }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: bulletPoints.map((point, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400", children: [
                  /* @__PURE__ */ jsx("span", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-[#811753] flex-shrink-0" }),
                  point
                ] }, i)) })
              ] }),
              product.variation && product.variation.length > 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-700 dark:text-neutral-300", children: "Available Options" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: product.variation.map((v) => {
                  const isActive = v.asin === identifier || v.selected;
                  const label = Object.values(v.dimensions).join(" / ");
                  return isActive ? /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "px-3 py-1.5 text-sm rounded-lg border border-[#811753] bg-[#811753]/10 text-[#811753] font-medium cursor-default",
                      title: v.asin,
                      children: label
                    },
                    v.asin
                  ) : /* @__PURE__ */ jsx(
                    Link,
                    {
                      href: `/product/${v.asin}`,
                      replace: true,
                      className: "px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-[#811753] hover:text-[#811753] hover:bg-[#811753]/5 transition-colors",
                      title: v.asin,
                      children: label
                    },
                    v.asin
                  );
                }) })
              ] }),
              seller && /* @__PURE__ */ jsxs("div", { className: "text-sm text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800", children: [
                "Sold by ",
                /* @__PURE__ */ jsx("span", { className: "font-medium text-neutral-700 dark:text-neutral-300", children: seller.name ?? seller.seller_name }),
                seller.shipped_from && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " · Ships from ",
                  seller.shipped_from
                ] })
              ] }),
              (product.url || product.scraped_url) && /* @__PURE__ */ jsxs(
                "a",
                {
                  href: product.url?.startsWith("http") ? product.url : `https://www.amazon.ae${product.url ?? ""}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#811753] hover:bg-[#61113E] rounded-lg transition-colors",
                  children: [
                    "View on Amazon.ae",
                    /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
                      /* @__PURE__ */ jsx("polyline", { points: "15 3 21 3 21 9" }),
                      /* @__PURE__ */ jsx("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
                    ] })
                  ]
                }
              )
            ] })
          ] }),
          product.technical_details && product.technical_details.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-neutral-900 dark:text-white mb-4", children: "Technical Details" }),
            /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden", children: /* @__PURE__ */ jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsx("tbody", { children: product.technical_details.map((td, i) => /* @__PURE__ */ jsxs("tr", { className: i % 2 === 0 ? "bg-neutral-50/50 dark:bg-neutral-800/30" : "", children: [
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 font-medium text-neutral-700 dark:text-neutral-300 w-1/3", children: td.name }),
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-neutral-500 dark:text-neutral-400", children: td.value })
            ] }, i)) }) }) })
          ] }),
          stars.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-12", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-neutral-900 dark:text-white mb-4", children: "Customer Ratings" }),
            /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-md", children: [...stars].sort((a, b) => b.rating - a.rating).map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-neutral-500 dark:text-neutral-400 w-14", children: [
                s.rating,
                " star"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-yellow-400 rounded-full transition-all duration-500",
                  style: { width: `${s.percentage}%` }
                }
              ) }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-neutral-400 w-10 text-right", children: [
                s.percentage,
                "%"
              ] })
            ] }, s.rating)) })
          ] }),
          reviews.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mt-12 mb-8", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-neutral-900 dark:text-white mb-4", children: "Top Reviews" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: reviews.map((r) => /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${s <= r.rating ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}`, viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }, s)) }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: r.author }),
                r.is_verified && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded", children: "Verified" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-4", children: r.content })
            ] }, r.id)) })
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
  Product as default
};
