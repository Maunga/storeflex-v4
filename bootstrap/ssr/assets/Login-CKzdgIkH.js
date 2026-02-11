import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false
  });
  const submit = (e) => {
    e.preventDefault();
    post("/login", {
      onFinish: () => reset("password")
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Log in" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center justify-center gap-2.5 mb-8", children: [
        /* @__PURE__ */ jsx("img", { src: "/images/logo.png", alt: "Storeflex", className: "h-10 w-auto" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-neutral-900 dark:text-white", children: "Storeflex" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-neutral-900 dark:text-white mb-2", children: "Welcome back" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mb-6", children: "Sign in to continue to Storeflex" }),
        status && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm text-green-600 dark:text-green-400", children: status }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5", children: "Email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "email",
                  type: "email",
                  value: data.email,
                  onChange: (e) => setData("email", e.target.value),
                  className: "w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#86efac]/20 focus:border-[#86efac] transition-colors",
                  placeholder: "you@gmail.com",
                  autoComplete: "username"
                }
              ),
              errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-red-500", children: errors.email })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5", children: "Password" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "password",
                  type: "password",
                  value: data.password,
                  onChange: (e) => setData("password", e.target.value),
                  className: "w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#86efac]/20 focus:border-[#86efac] transition-colors",
                  placeholder: "••••••••",
                  autoComplete: "current-password"
                }
              ),
              errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-red-500", children: errors.password })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: data.remember,
                    onChange: (e) => setData("remember", e.target.checked),
                    className: "w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-[#86efac] focus:ring-[#86efac]/20"
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: "Remember me" })
              ] }),
              canResetPassword && /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/forgot-password",
                  className: "text-sm text-[#a855f7] hover:underline",
                  children: "Forgot password?"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "w-full mt-6 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: processing ? "Signing in..." : "Sign in"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { href: "/register", className: "text-[#a855f7] hover:underline font-medium", children: "Sign up" })
      ] })
    ] }) })
  ] });
}
export {
  Login as default
};
