import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { usePage, Head, Link, router } from "@inertiajs/react";
function Toast({ message, type = "error", duration = 5e3, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    if (message) {
      setVisible(true);
      setExiting(false);
      const timer = setTimeout(() => {
        dismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const dismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onDismiss?.();
    }, 300);
  };
  if (!visible || !message) return null;
  const bgColor = {
    error: "bg-red-600 dark:bg-red-500",
    success: "bg-emerald-600 dark:bg-emerald-500",
    info: "bg-blue-600 dark:bg-blue-500"
  }[type];
  const icon = {
    error: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
      /* @__PURE__ */ jsx("line", { x1: "15", y1: "9", x2: "9", y2: "15" }),
      /* @__PURE__ */ jsx("line", { x1: "9", y1: "9", x2: "15", y2: "15" })
    ] }),
    success: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
      /* @__PURE__ */ jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
    ] }),
    info: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
      /* @__PURE__ */ jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
      /* @__PURE__ */ jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })
    ] })
  }[type];
  return /* @__PURE__ */ jsx("div", { className: "fixed top-6 right-6 z-[9999]", children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium max-w-md ${bgColor} ${exiting ? "animate-toast-exit" : "animate-toast-enter"}`,
      children: [
        icon,
        /* @__PURE__ */ jsx("span", { className: "leading-snug", children: message }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: dismiss,
            className: "ml-2 p-0.5 rounded-md hover:bg-white/20 transition-colors flex-shrink-0",
            children: /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        )
      ]
    }
  ) });
}
const marketingStatements = [
  { text: "Amazon.ae" },
  { text: "any product name" },
  { text: "a direct link" }
];
function Welcome({ auth, canLogin, canRegister }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const { toast } = usePage().props;
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("error");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (toast) {
      setToastType(toast.type ?? "error");
      setToastMessage(toast.message);
    }
  }, [toast]);
  useEffect(() => {
    const currentStatement = marketingStatements[currentIndex].text;
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = 2e3;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentStatement.length) {
          setDisplayText(currentStatement.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % marketingStatements.length);
        }
      }
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex]);
  const handleTextareaInput = (e) => {
    setQuery(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };
  const setQuickAction = (value) => {
    setQuery(value);
    textareaRef.current?.focus();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    const isAmazonUrl = /^https?:\/\/(www\.)?amazon\.ae\//i.test(trimmed);
    if (isAmazonUrl) {
      router.post("/search", { query: trimmed }, {
        onFinish: () => setLoading(false)
      });
    } else {
      router.get("/search", { q: trimmed }, {
        onFinish: () => setLoading(false)
      });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Your Dropshipping Assistant" }),
    /* @__PURE__ */ jsx(Toast, { message: toastMessage, type: toastType, onDismiss: () => setToastMessage(null) }),
    loading && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-white/60 dark:bg-neutral-950/60 z-50 flex items-center justify-center backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 animate-fade-in", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-neutral-200 dark:border-neutral-700 border-t-[#811753] rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Searching..." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950", children: [
      auth?.user && /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]", title: auth.user.email, children: auth.user.email }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/logout",
              method: "post",
              as: "button",
              className: "text-xs text-neutral-500 hover:text-[#811753] dark:text-neutral-400 dark:hover:text-pink-400 transition-colors",
              children: "Log out"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500 dark:text-neutral-400", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mb-3 opacity-40", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-[13px] leading-relaxed", children: "Your search history will appear here." })
        ] })
      ] }),
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
          canLogin && /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-3", children: auth?.user ? /* @__PURE__ */ jsx(
            Link,
            {
              href: "/dashboard",
              className: "px-4 py-2 text-sm font-medium text-white bg-[#811753] hover:bg-[#61113E] rounded-lg transition-colors",
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
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "flex-1 flex flex-col items-center justify-center px-6 py-10 text-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[720px] w-full animate-fade-in", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 mb-6 text-[13px] font-medium text-[#eab308] bg-[#eab308]/10 rounded-full animate-fade-in animation-delay-100", children: [
            /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }) }),
            "Powered by DXB Runners"
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4 text-neutral-900 dark:text-white animate-fade-in animation-delay-100", children: [
            "Find products from",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsxs("span", { className: "bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-500 bg-clip-text text-transparent inline-block min-w-[200px] sm:min-w-[280px]", children: [
              displayText,
              /* @__PURE__ */ jsx("span", { className: "animate-cursor text-pink-400", children: "|" })
            ] }),
            " ",
            "instantly"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[17px] text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed animate-fade-in animation-delay-200", children: "Paste an Amazon.ae link or search for any product. We'll help you source and supply it through our dropshipping network." }),
          /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "w-full max-w-[640px] mx-auto animate-fade-in animation-delay-200", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow focus-within:border-[#811753] focus-within:ring-[3px] focus-within:ring-[#811753]/15", children: [
            /* @__PURE__ */ jsx(
              "textarea",
              {
                ref: textareaRef,
                name: "query",
                value: query,
                onChange: handleTextareaInput,
                className: "w-full min-h-[64px] max-h-[200px] p-5 pr-[60px] text-base leading-relaxed bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 border-none resize-none outline-none",
                placeholder: "Paste an Amazon.ae link or search for a product...",
                rows: 1
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-md", children: [
                  /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                    /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
                    /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
                  ] }),
                  "Paste URL"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-md", children: [
                  /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                    /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
                    /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
                  ] }),
                  "Search product"
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  className: "flex items-center justify-center w-10 h-10 bg-[#811753] hover:bg-[#61113E] text-white rounded-[10px] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  disabled: !query.trim(),
                  children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                    /* @__PURE__ */ jsx("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
                    /* @__PURE__ */ jsx("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })
                  ] })
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center gap-2.5 mt-8 animate-fade-in animation-delay-300", children: [
            /* @__PURE__ */ jsx(
              QuickActionButton,
              {
                onClick: () => setQuickAction("https://www.amazon.ae/dp/"),
                icon: /* @__PURE__ */ jsx("path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" }),
                label: "Electronics"
              }
            ),
            /* @__PURE__ */ jsx(
              QuickActionButton,
              {
                onClick: () => setQuickAction("Fashion accessories"),
                icon: /* @__PURE__ */ jsx("path", { d: "M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46A2 2 0 0 0 2 5.38v13.24a2 2 0 0 0 1.62 1.96L8 22a4 4 0 0 0 8 0l4.38-1.42A2 2 0 0 0 22 18.62V5.38a2 2 0 0 0-1.62-1.92z" }),
                label: "Fashion"
              }
            ),
            /* @__PURE__ */ jsx(
              QuickActionButton,
              {
                onClick: () => setQuickAction("Home kitchen items"),
                icon: /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
                  /* @__PURE__ */ jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
                ] }),
                label: "Home & Kitchen"
              }
            ),
            /* @__PURE__ */ jsx(
              QuickActionButton,
              {
                onClick: () => setQuickAction("Sports outdoor gear"),
                icon: /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
                  /* @__PURE__ */ jsx("polygon", { points: "16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" })
                ] }),
                label: "Sports"
              }
            )
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
function QuickActionButton({ onClick, icon, label }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-[10px] hover:border-[#811753] hover:text-[#811753] transition-colors",
      children: [
        /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: icon }),
        label
      ]
    }
  );
}
export {
  Welcome as default
};
