import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
const CheckCircle = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) });
const Package = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" }) });
const ArrowRight = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14 5l7 7m0 0l-7 7m7-7H3" }) });
function CheckoutSuccess({ reference, provider, order }) {
  const providerLabels = {
    ecocash: "EcoCash",
    paynow: "Paynow",
    paypal: "PayPal",
    stripe: "Stripe"
  };
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(amount);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Payment Successful" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6", children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-10 w-10 text-green-600" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Payment Successful!" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-6", children: [
          "Thank you for your order. Your payment has been processed successfully",
          provider && ` via ${providerLabels[provider] || provider}`,
          "."
        ] }),
        order && /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-6 text-left", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Package, { className: "h-5 w-5" }),
            "Order Details"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Order ID:" }),
              /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                "#",
                order.id
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Total:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatCurrency(order.total, order.currency) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Amount Paid:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-green-600", children: formatCurrency(order.amount_paid, order.currency) })
            ] }),
            order.amount_paid < order.total && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Remaining Balance:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-600", children: formatCurrency(order.total - order.amount_paid, order.currency) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2 border-t", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Status:" }),
              /* @__PURE__ */ jsx("span", { className: `font-medium capitalize ${order.status === "processing" ? "text-green-600" : order.status === "partially-paid" ? "text-orange-600" : "text-gray-900"}`, children: order.status?.replace("-", " ") })
            ] })
          ] })
        ] }),
        reference && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mb-6", children: [
          "Reference: ",
          /* @__PURE__ */ jsx("span", { className: "font-mono", children: reference })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-6", children: "You will receive an email confirmation shortly with your order details." }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/",
            className: "inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors",
            children: [
              "Continue Shopping",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-8 text-sm text-gray-500", children: [
        "Need help?",
        " ",
        /* @__PURE__ */ jsx("a", { href: "mailto:support@storeflex.co.zw", className: "text-orange-600 hover:underline", children: "Contact Support" })
      ] })
    ] })
  ] });
}
export {
  CheckoutSuccess as default
};
