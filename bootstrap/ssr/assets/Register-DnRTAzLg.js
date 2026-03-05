import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post("/register", {
      onFinish: () => reset("password", "password_confirmation")
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create an account" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center justify-center gap-2.5 mb-8", children: [
        /* @__PURE__ */ jsx("img", { src: "/images/logo.png", alt: "Storeflex", className: "h-10 w-auto" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-neutral-900 dark:text-white", children: "Storeflex" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-neutral-900 dark:text-white mb-2", children: "Create an account" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mb-6", children: "Start dropshipping with Amazon.ae products" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5", children: "Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "name",
                  type: "text",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#86efac]/20 focus:border-[#86efac] transition-colors",
                  placeholder: "Your name",
                  autoComplete: "name"
                }
              ),
              errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-red-500", children: errors.name })
            ] }),
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
                  autoComplete: "new-password"
                }
              ),
              errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-red-500", children: errors.password })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "password_confirmation", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5", children: "Confirm Password" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "password_confirmation",
                  type: "password",
                  value: data.password_confirmation,
                  onChange: (e) => setData("password_confirmation", e.target.value),
                  className: "w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#86efac]/20 focus:border-[#86efac] transition-colors",
                  placeholder: "••••••••",
                  autoComplete: "new-password"
                }
              ),
              errors.password_confirmation && /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-red-500", children: errors.password_confirmation })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "w-full mt-6 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: processing ? "Creating account..." : "Create account"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { href: "/login", className: "text-[#a855f7] hover:underline font-medium", children: "Sign in" })
      ] })
    ] }) })
  ] });
}
export {
  Register as default
};
