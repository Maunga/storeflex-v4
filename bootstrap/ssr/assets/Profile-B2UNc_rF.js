import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
function Profile({ auth, mustVerifyEmail, status }) {
  const user = auth.user;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { data: profileData, setData: setProfileData, patch, processing: profileProcessing, errors: profileErrors, recentlySuccessful: profileSuccess } = useForm({
    name: user.name,
    email: user.email
  });
  const { data: passwordData, setData: setPasswordData, put, processing: passwordProcessing, errors: passwordErrors, recentlySuccessful: passwordSuccess, reset: resetPassword } = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const { data: deleteData, setData: setDeleteData, delete: destroy, processing: deleteProcessing, errors: deleteErrors, reset: resetDelete } = useForm({
    password: ""
  });
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    patch("/profile", {
      preserveScroll: true
    });
  };
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    put("/password", {
      preserveScroll: true,
      onSuccess: () => resetPassword()
    });
  };
  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    destroy("/profile", {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Profile Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950", children: [
      /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-[260px] flex-col p-4 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[180px]", title: user.email, children: user.email }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/logout",
              method: "post",
              as: "button",
              className: "text-xs text-neutral-500 hover:text-[#86efac] dark:text-neutral-400 dark:hover:text-pink-400 transition-colors",
              children: "Log out"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "flex-1 space-y-1", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/dashboard",
              className: "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
              children: [
                /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "7", height: "9" }),
                  /* @__PURE__ */ jsx("rect", { x: "14", y: "3", width: "7", height: "5" }),
                  /* @__PURE__ */ jsx("rect", { x: "14", y: "12", width: "7", height: "9" }),
                  /* @__PURE__ */ jsx("rect", { x: "3", y: "16", width: "7", height: "5" })
                ] }),
                "Dashboard"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium", children: [
            /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "7", r: "4" })
            ] }),
            "Profile Settings"
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
        /* @__PURE__ */ jsx("main", { className: "flex-1 p-4 sm:p-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white", children: "Profile Settings" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-1", children: "Profile Information" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mb-4", children: "Update your account's profile information and email address." }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleProfileSubmit, className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Name" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "name",
                    type: "text",
                    value: profileData.name,
                    onChange: (e) => setProfileData("name", e.target.value),
                    className: "w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all",
                    required: true
                  }
                ),
                profileErrors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: profileErrors.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "email",
                    type: "email",
                    value: profileData.email,
                    onChange: (e) => setProfileData("email", e.target.value),
                    className: "w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all",
                    required: true
                  }
                ),
                profileErrors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: profileErrors.email })
              ] }),
              mustVerifyEmail && !user.email_verified_at && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-700 dark:text-yellow-400", children: [
                  "Your email address is unverified.",
                  " ",
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      href: "/email/verification-notification",
                      method: "post",
                      as: "button",
                      className: "underline hover:text-yellow-800 dark:hover:text-yellow-300",
                      children: "Click here to re-send the verification email."
                    }
                  )
                ] }),
                status === "verification-link-sent" && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-green-600 dark:text-green-400", children: "A new verification link has been sent to your email address." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: profileProcessing,
                    className: "px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50",
                    children: profileProcessing ? "Saving..." : "Save"
                  }
                ),
                profileSuccess && /* @__PURE__ */ jsx("span", { className: "text-sm text-green-600 dark:text-green-400", children: "Saved." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-1", children: "Update Password" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mb-4", children: "Ensure your account is using a long, random password to stay secure." }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handlePasswordSubmit, className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "current_password", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Current Password" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "current_password",
                    type: "password",
                    value: passwordData.current_password,
                    onChange: (e) => setPasswordData("current_password", e.target.value),
                    className: "w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all",
                    autoComplete: "current-password"
                  }
                ),
                passwordErrors.current_password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: passwordErrors.current_password })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "New Password" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "password",
                    type: "password",
                    value: passwordData.password,
                    onChange: (e) => setPasswordData("password", e.target.value),
                    className: "w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all",
                    autoComplete: "new-password"
                  }
                ),
                passwordErrors.password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: passwordErrors.password })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "password_confirmation", className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Confirm Password" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "password_confirmation",
                    type: "password",
                    value: passwordData.password_confirmation,
                    onChange: (e) => setPasswordData("password_confirmation", e.target.value),
                    className: "w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-[#86efac] focus:ring-2 focus:ring-[#86efac]/15 transition-all",
                    autoComplete: "new-password"
                  }
                ),
                passwordErrors.password_confirmation && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: passwordErrors.password_confirmation })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: passwordProcessing,
                    className: "px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50",
                    children: passwordProcessing ? "Saving..." : "Save"
                  }
                ),
                passwordSuccess && /* @__PURE__ */ jsx("span", { className: "text-sm text-green-600 dark:text-green-400", children: "Saved." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-xl border border-red-200 dark:border-red-900/50 p-4 sm:p-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-1", children: "Delete Account" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mb-4", children: "Once your account is deleted, all of its resources and data will be permanently deleted." }),
            !showDeleteConfirm ? /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowDeleteConfirm(true),
                className: "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors",
                children: "Delete Account"
              }
            ) : /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700 dark:text-red-400", children: "Are you sure you want to delete your account? Please enter your password to confirm." }),
              /* @__PURE__ */ jsxs("form", { onSubmit: handleDeleteSubmit, className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "password",
                      value: deleteData.password,
                      onChange: (e) => setDeleteData("password", e.target.value),
                      placeholder: "Password",
                      className: "w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
                    }
                  ),
                  deleteErrors.password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: deleteErrors.password })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setShowDeleteConfirm(false);
                        resetDelete();
                      },
                      className: "px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors",
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: deleteProcessing,
                      className: "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50",
                      children: deleteProcessing ? "Deleting..." : "Delete Account"
                    }
                  )
                ] })
              ] })
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
  Profile as default
};
