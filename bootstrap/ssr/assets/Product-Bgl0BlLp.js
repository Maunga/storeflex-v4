import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import { T as Toast } from "./Toast-2CzZTQ7I.js";
import { S as SidebarBookmarks, B as BookmarksDrawer } from "./SidebarBookmarks-DXCEFl9f.js";
import { S as SEO } from "./SEO-_RAcpsXN.js";
import axios from "axios";
function Product({ auth, product, identifier, canLogin, canRegister }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("info");
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  useEffect(() => {
    if (auth?.user) {
      axios.get("/bookmarks").then((res) => {
        setBookmarks(res.data);
        const found = res.data.some((b) => b.asin === identifier);
        setIsBookmarked(found);
      }).catch(() => {
      });
    }
  }, [auth?.user, identifier]);
  const handleBookmark = async () => {
    if (!auth?.user) {
      setToastType("info");
      setToastMessage("Please log in to save bookmarks");
      setTimeout(() => {
      }, 1500);
      return;
    }
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await axios.delete("/bookmarks", { data: { asin: identifier } });
        setBookmarks((prev) => prev.filter((b) => b.asin !== identifier));
        setIsBookmarked(false);
      } else {
        const res = await axios.post("/bookmarks", {
          img_url: product.images?.[0] ?? "",
          title: product.title ?? "Unknown Product",
          price: product.dxb_price ? parseFloat(product.dxb_price) : product.price ?? 0,
          asin: identifier
        });
        if (res.data.success) {
          setBookmarks((prev) => [res.data.bookmark, ...prev]);
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setIsBookmarked(true);
      }
    } finally {
      setBookmarkLoading(false);
    }
  };
  const images = product.images ?? [];
  const bulletPoints = product.bullet_points ? product.bullet_points.split("\n").filter(Boolean) : [];
  const categories = product.category?.[0]?.ladder?.map((c) => c.name) ?? [];
  product.delivery ?? product.buybox?.[0]?.delivery_details ?? [];
  product.featured_merchant ?? product.buybox?.[0] ?? null;
  const reviews = product.reviews?.slice(0, 6) ?? [];
  const stars = product.rating_stars_distribution ?? [];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: product.title ?? "Product",
        description: `Buy ${product.title ?? "this product"} - shipped from Dubai to Zimbabwe. ${product.dxb_price ? `Price: $${product.dxb_price}` : ""} Fast delivery, authentic products from Amazon UAE.`,
        keywords: `${product.title ?? "product"}, buy online Zimbabwe, Dubai shipping, Amazon UAE, ${categories.join(", ")}`,
        image: product.images?.[0],
        type: "product"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950", children: [
      auth?.user && /* @__PURE__ */ jsx(SidebarBookmarks, { user: auth.user, bookmarks, activeAsin: identifier }),
      auth?.user && /* @__PURE__ */ jsx(
        BookmarksDrawer,
        {
          user: auth.user,
          bookmarks,
          activeAsin: identifier,
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
          canLogin && /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors", children: [
              /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                /* @__PURE__ */ jsx("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
                /* @__PURE__ */ jsx("polyline", { points: "12 19 5 12 12 5" })
              ] }),
              "New Search"
            ] }),
            auth?.user ? /* @__PURE__ */ jsx(
              Link,
              {
                href: "/dashboard",
                className: "px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors",
                children: "Dashboard"
              }
            ) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/login",
                  className: "px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-bold",
                  children: "Log in"
                }
              ),
              canRegister && /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/register",
                  className: "px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors",
                  children: "Get Started"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "flex-1 px-4 sm:px-6 py-8 sm:py-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto animate-page-enter", children: [
          categories.length > 0 && /* @__PURE__ */ jsx("nav", { className: "flex flex-wrap items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mb-6", children: categories.map((cat, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            i > 0 && /* @__PURE__ */ jsx("span", { children: "/" }),
            /* @__PURE__ */ jsx("span", { className: "hover:text-neutral-600 dark:hover:text-neutral-300", children: cat })
          ] }, i)) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "space-y-3 animate-fade-in-up lg:sticky lg:top-24", children: images.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative aspect-square bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex items-center justify-center p-6 cursor-zoom-in group",
                  onClick: () => setLightboxOpen(true),
                  children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: images[selectedImage],
                        alt: product.title,
                        className: "max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" }),
                    /* @__PURE__ */ jsxs("span", { className: "absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 bg-white/90 dark:bg-neutral-800/90 dark:text-neutral-400 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity", children: [
                      /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                        /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
                        /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
                        /* @__PURE__ */ jsx("line", { x1: "11", y1: "8", x2: "11", y2: "14" }),
                        /* @__PURE__ */ jsx("line", { x1: "8", y1: "11", x2: "14", y2: "11" })
                      ] }),
                      "Click to zoom"
                    ] }),
                    product.amazon_choice && /* @__PURE__ */ jsx("span", { className: "absolute top-4 left-4 px-2.5 py-1 text-xs font-semibold text-white bg-[#232F3E] rounded-md shadow-sm", children: "Amazon's Choice" }),
                    product.discount_percentage && product.discount_percentage > 0 && /* @__PURE__ */ jsxs("span", { className: "absolute top-4 right-4 px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-md shadow-sm", children: [
                      "-",
                      product.discount_percentage,
                      "%"
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 gap-2", children: images.slice(0, 6).map((img, i) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSelectedImage(i),
                  className: `aspect-square rounded-xl border-2 overflow-hidden transition-all ${selectedImage === i ? "border-emerald-500 dark:border-[#86efac] ring-2 ring-[#86efac]/20 shadow-sm" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"}`,
                  children: /* @__PURE__ */ jsx("img", { src: img, alt: "", className: "w-full h-full object-contain bg-white dark:bg-neutral-900 p-1.5" })
                },
                i
              )) }),
              images.length > 6 && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setLightboxOpen(true),
                  className: "w-full text-center text-xs text-neutral-400 hover:text-emerald-700 dark:hover:text-[#86efac] transition-colors py-1",
                  children: [
                    "+",
                    images.length - 6,
                    " more images"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                Lightbox,
                {
                  open: lightboxOpen,
                  close: () => setLightboxOpen(false),
                  index: selectedImage,
                  slides: images.map((src) => ({ src })),
                  plugins: [Zoom, Thumbnails],
                  zoom: { maxZoomPixelRatio: 4, scrollToZoom: true },
                  thumbnails: { width: 80, height: 80, borderRadius: 8 },
                  on: { view: ({ index }) => setSelectedImage(index) },
                  styles: {
                    container: { backgroundColor: "rgba(0, 0, 0, 0.9)" }
                  },
                  carousel: { finite: images.length <= 1 }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-fade-in-up animate-delay-100", children: [
              product.brand && /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-emerald-700 dark:text-[#86efac] uppercase tracking-wide", children: product.brand }),
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
              bulletPoints.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-700 dark:text-neutral-300", children: "About this item" }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: bulletPoints.map((point, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400", children: [
                  /* @__PURE__ */ jsx("span", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#86efac] flex-shrink-0" }),
                  point
                ] }, i)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-fade-in-up animate-delay-200 lg:sticky lg:top-24", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleBookmark,
                  disabled: bookmarkLoading,
                  className: `w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${isBookmarked ? "bg-[#86efac]/20 text-emerald-700 dark:text-[#86efac] border-2 border-[#86efac]" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-2 border-transparent"} ${bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`,
                  children: [
                    bookmarkLoading ? /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [
                      /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                      /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                    ] }) : /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${isBookmarked ? "fill-current" : ""}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" }) }),
                    isBookmarked ? "Bookmarked" : "Add Bookmark"
                  ]
                }
              ),
              (product.url || product.scraped_url) && /* @__PURE__ */ jsxs(
                "a",
                {
                  href: product.url?.startsWith("http") ? product.url : `https://www.amazon.ae${product.url ?? ""}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-700 dark:text-[#86efac] border-2 border-emerald-600 dark:border-[#86efac] hover:bg-emerald-50 dark:hover:bg-[#86efac]/10 rounded-lg transition-colors",
                  children: [
                    "View on Amazon.ae",
                    /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
                      /* @__PURE__ */ jsx("polyline", { points: "15 3 21 3 21 9" }),
                      /* @__PURE__ */ jsx("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
                    ] })
                  ]
                }
              ),
              product.variation && product.variation.length > 1 && /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-700 dark:text-neutral-300", children: "Available Options" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: product.variation.map((v) => {
                  const isActive = v.asin === identifier || v.selected;
                  const label = Object.values(v.dimensions).join(" / ");
                  return isActive ? /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "px-3 py-2 text-sm rounded-lg border border-[#86efac] bg-[#86efac]/10 text-emerald-700 dark:text-[#86efac] font-medium cursor-default",
                      title: v.asin,
                      children: label
                    },
                    v.asin
                  ) : /* @__PURE__ */ jsx(
                    Link,
                    {
                      href: `/product/${v.asin}`,
                      replace: true,
                      className: "px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-[#86efac] hover:text-emerald-700 dark:hover:text-[#86efac] hover:bg-[#86efac]/5 transition-colors",
                      title: v.asin,
                      children: label
                    },
                    v.asin
                  );
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4 shadow-sm", children: [
                product.price != null && product.price > 0 && product.stock !== "Currently unavailable" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  product.dxb_price && /* @__PURE__ */ jsxs("div", { className: "pb-4 border-b border-neutral-100 dark:border-neutral-700", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1", children: "Your Price (Delivered to Zimbabwe)" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-4xl font-extrabold text-emerald-700 dark:text-[#86efac] tracking-tight", children: [
                        "$",
                        product.dxb_price
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-400", children: "USD" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Includes shipping & handling" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs text-neutral-400 block mb-0.5", children: "Amazon.ae Price" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
                        /* @__PURE__ */ jsxs("span", { className: "text-lg font-semibold text-neutral-600 dark:text-neutral-300", children: [
                          product.currency ?? "AED",
                          " ",
                          product.price
                        ] }),
                        product.price_strikethrough != null && product.price_strikethrough > 0 && /* @__PURE__ */ jsxs("span", { className: "text-sm text-neutral-400 line-through", children: [
                          product.currency ?? "AED",
                          " ",
                          product.price_strikethrough
                        ] })
                      ] })
                    ] }),
                    product.discount_percentage && product.discount_percentage > 0 && /* @__PURE__ */ jsxs("span", { className: "px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full", children: [
                      product.discount_percentage,
                      "% OFF"
                    ] })
                  ] })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-neutral-500 dark:text-neutral-400 font-medium", children: "Price unavailable" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "Check back later or view on Amazon" })
                ] }),
                product.stock && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-700 ${product.stock === "In Stock" ? "text-emerald-600" : "text-red-500"}`, children: [
                  /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full ${product.stock === "In Stock" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}` }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: product.stock })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: `/checkout/${identifier}`,
                  className: "w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:text-neutral-900 dark:hover:bg-emerald-400 rounded-lg transition-colors shadow-sm",
                  children: [
                    /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("circle", { cx: "9", cy: "21", r: "1" }),
                      /* @__PURE__ */ jsx("circle", { cx: "20", cy: "21", r: "1" }),
                      /* @__PURE__ */ jsx("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })
                    ] }),
                    "Buy Now"
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
    ] }),
    /* @__PURE__ */ jsx(
      Toast,
      {
        message: toastMessage,
        type: toastType,
        onDismiss: () => setToastMessage(null)
      }
    )
  ] });
}
export {
  Product as default
};
