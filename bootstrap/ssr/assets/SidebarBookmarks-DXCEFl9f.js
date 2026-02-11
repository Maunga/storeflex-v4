import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
function BookmarksContent({ user, bookmarks, activeAsin = null, className = "", showClose = false, onClose }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex h-full flex-col ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800", children: [
      /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]", title: user.email, children: user.email }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        showClose && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
            "aria-label": "Close menu",
            children: /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        ),
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
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3", children: "Bookmarks" }),
      bookmarks.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: bookmarks.map((bookmark) => /* @__PURE__ */ jsxs(
        Link,
        {
          href: bookmark.asin ? `/product/${bookmark.asin}` : "#",
          className: `flex items-center gap-3 p-2 rounded-lg transition-colors ${activeAsin && bookmark.asin === activeAsin ? "bg-[#86efac]/10 border border-[#86efac]/30" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`,
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
  ] });
}
function SidebarBookmarks({ user, bookmarks, activeAsin = null }) {
  return /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex w-[260px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsx(BookmarksContent, { user, bookmarks, activeAsin, className: "p-4" }) });
}
function BookmarksDrawer({ user, bookmarks, activeAsin = null, isOpen, onClose }) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "absolute inset-0 bg-neutral-950/40",
        onClick: onClose,
        "aria-label": "Close menu"
      }
    ),
    /* @__PURE__ */ jsx("aside", { className: "relative h-full w-[280px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-2xl", children: /* @__PURE__ */ jsx(
      BookmarksContent,
      {
        user,
        bookmarks,
        activeAsin,
        className: "p-4",
        showClose: true,
        onClose
      }
    ) })
  ] });
}
export {
  BookmarksDrawer as B,
  SidebarBookmarks as S
};
