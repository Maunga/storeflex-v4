import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { S as SidebarBookmarks, B as BookmarksDrawer } from "./SidebarBookmarks-DXCEFl9f.js";
import axios from "axios";
const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
};
function Orders({ auth, orders }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  useEffect(() => {
    if (auth?.user) {
      axios.get("/bookmarks").then((res) => setBookmarks(res.data)).catch(() => {
      });
    }
  }, [auth?.user]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Order History" }),
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
          /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/dashboard",
                className: "px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors",
                children: "Dashboard"
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
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white", children: "Order history" }),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/",
                className: "text-sm font-medium text-emerald-600 dark:text-[#86efac] hover:underline",
                children: "New search"
              }
            )
          ] }),
          orders?.data?.length ? /* @__PURE__ */ jsx("div", { className: "space-y-4", children: orders.data.map((order) => /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-neutral-900 dark:text-white", children: [
                  "Order #",
                  order.id
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: [
                  formatDate(order.created_at),
                  order.woocommerce_order_id ? ` · WooCommerce ${order.woocommerce_order_id}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold text-neutral-900 dark:text-white", children: [
                "AED ",
                order.total
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-2", children: (order.purchased_items || []).map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.product?.image || "/placeholder.png",
                  alt: item.product?.name || "Item",
                  className: "w-12 h-12 rounded-lg object-contain bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-900 dark:text-white line-clamp-1", children: item.product?.name || "Order item" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: [
                  "Qty: ",
                  item.quantity
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm text-neutral-600 dark:text-neutral-300", children: [
                "AED ",
                item.total
              ] })
            ] }, item.id)) })
          ] }, order.id)) }) : /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 text-center text-neutral-500 dark:text-neutral-400", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No orders yet." }),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/",
                className: "inline-flex mt-3 text-sm font-medium text-emerald-600 dark:text-[#86efac] hover:underline",
                children: "Start a new search"
              }
            )
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Orders as default
};
