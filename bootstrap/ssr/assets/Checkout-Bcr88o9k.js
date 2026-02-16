import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { T as Toast } from "./Toast-2CzZTQ7I.js";
import axios from "axios";
function Checkout({ auth, product, identifier, savedCheckoutData }) {
  const [step, setStep] = useState("shipping");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("info");
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [shippingSpeed, setShippingSpeed] = useState("regular");
  const basePrice = parseFloat(String(product.dxb_price ?? product.price ?? 0)) || 0;
  const shippingFee = shippingSpeed === "express" ? 5 : 0;
  const totalPrice = basePrice + shippingFee;
  const [shippingInfo, setShippingInfo] = useState({
    first_name: savedCheckoutData.shipping?.first_name || "",
    last_name: savedCheckoutData.shipping?.last_name || "",
    address_1: savedCheckoutData.shipping?.address_1 || "",
    address_2: savedCheckoutData.shipping?.address_2 || "",
    city: savedCheckoutData.shipping?.city || "",
    state: savedCheckoutData.shipping?.state || "",
    postcode: savedCheckoutData.shipping?.postcode || "263",
    country: savedCheckoutData.shipping?.country || "ZW",
    email: savedCheckoutData.shipping?.email || auth?.user?.email || "",
    phone: savedCheckoutData.shipping?.phone || ""
  });
  const [billingInfo, setBillingInfo] = useState({
    first_name: savedCheckoutData.billing?.first_name || "",
    last_name: savedCheckoutData.billing?.last_name || "",
    address_1: savedCheckoutData.billing?.address_1 || "",
    address_2: savedCheckoutData.billing?.address_2 || "",
    city: savedCheckoutData.billing?.city || "",
    state: savedCheckoutData.billing?.state || "",
    postcode: savedCheckoutData.billing?.postcode || "263",
    country: savedCheckoutData.billing?.country || "ZW",
    email: savedCheckoutData.billing?.email || auth?.user?.email || "",
    phone: savedCheckoutData.billing?.phone || ""
  });
  const [sameAsShipping, setSameAsShipping] = useState(
    savedCheckoutData.billing ? JSON.stringify(savedCheckoutData.shipping) === JSON.stringify(savedCheckoutData.billing) : true
  );
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [saveProfile, setSaveProfile] = useState(!!auth?.user);
  const hasSavedDetails = Boolean(
    savedCheckoutData.shipping?.first_name && savedCheckoutData.shipping?.last_name && savedCheckoutData.shipping?.phone && savedCheckoutData.shipping?.email
  );
  const [useExpressCheckout, setUseExpressCheckout] = useState(hasSavedDetails);
  const [showSavedDetailsCard, setShowSavedDetailsCard] = useState(hasSavedDetails);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentPollUrl, setPaymentPollUrl] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [pendingOrderReference, setPendingOrderReference] = useState(null);
  const [showPaymentPercentageModal, setShowPaymentPercentageModal] = useState(false);
  const [selectedPaymentPercentage, setSelectedPaymentPercentage] = useState(100);
  const [ecocashPhone, setEcocashPhone] = useState("");
  const prevShippingContactRef = useRef({
    first_name: shippingInfo.first_name,
    last_name: shippingInfo.last_name,
    email: shippingInfo.email,
    phone: shippingInfo.phone
  });
  useEffect(() => {
    loadAgentsAndPaymentMethods();
  }, []);
  useEffect(() => {
    const prevContact = prevShippingContactRef.current;
    setBillingInfo((prev) => {
      const updates = {};
      if (prev.first_name === prevContact.first_name) {
        updates.first_name = shippingInfo.first_name;
      }
      if (prev.last_name === prevContact.last_name) {
        updates.last_name = shippingInfo.last_name;
      }
      if (prev.email === prevContact.email) {
        updates.email = shippingInfo.email;
      }
      if (prev.phone === prevContact.phone) {
        updates.phone = shippingInfo.phone;
      }
      if (Object.keys(updates).length === 0) {
        return prev;
      }
      return { ...prev, ...updates };
    });
    prevShippingContactRef.current = {
      first_name: shippingInfo.first_name,
      last_name: shippingInfo.last_name,
      email: shippingInfo.email,
      phone: shippingInfo.phone
    };
  }, [shippingInfo.first_name, shippingInfo.last_name, shippingInfo.email, shippingInfo.phone]);
  useEffect(() => {
    if (deliveryMethod === "pickup" && sameAsShipping) {
      setSameAsShipping(false);
    }
  }, [deliveryMethod, sameAsShipping]);
  useEffect(() => {
    if (!ecocashPhone && shippingInfo.phone && shippingInfo.phone.length > 3) {
      setEcocashPhone("");
    }
  }, [shippingInfo.phone]);
  async function loadAgentsAndPaymentMethods() {
    try {
      const [agentsResponse, paymentMethodsResponse] = await Promise.all([
        axios.get("/api/checkout/agents"),
        axios.get("/api/payments/methods")
      ]);
      const agentsData = agentsResponse.data;
      const paymentMethodsData = paymentMethodsResponse.data;
      setAgents(agentsData || []);
      setPaymentMethods(paymentMethodsData || []);
      if (agentsData?.length > 0) setSelectedAgent(agentsData[0]);
      if (paymentMethodsData?.length > 0) setSelectedPaymentMethod(paymentMethodsData[0]);
    } catch (error) {
      console.error("Error loading data:", error);
      setToastType("error");
      setToastMessage("Failed to load checkout data");
    }
  }
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep("billing");
  };
  const handleBillingSubmit = (e) => {
    e.preventDefault();
    setStep("payment");
  };
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedAgent || !selectedPaymentMethod) {
      setToastType("error");
      setToastMessage("Please select an agent and payment method");
      return;
    }
    if (selectedPaymentMethod.requires_phone && !ecocashPhone) {
      setToastType("error");
      setToastMessage("Please enter your EcoCash phone number");
      return;
    }
    if (selectedPaymentMethod.type === "cash") {
      await processOrderWithPayment(100);
      return;
    }
    setShowPaymentPercentageModal(true);
  };
  const processOrderWithPayment = async (paymentPercentage) => {
    setShowPaymentPercentageModal(false);
    setLoading(true);
    setPaymentProcessing(false);
    setPaymentMessage(null);
    const paymentAmount = paymentPercentage === 100 ? totalPrice : totalPrice * 0.75;
    try {
      const checkoutData = {
        asin: identifier,
        quantity: 1,
        delivery_method: deliveryMethod,
        shipping: shippingInfo,
        billing: sameAsShipping ? shippingInfo : billingInfo,
        extras: {
          payment_method: {
            id: selectedPaymentMethod.id,
            title: selectedPaymentMethod.title
          },
          agent: {
            ID: selectedAgent.ID,
            display_name: selectedAgent.display_name
          },
          shipping_speed: {
            id: shippingSpeed,
            title: shippingSpeed === "express" ? "Express" : "Regular",
            fee: shippingFee
          },
          payment_percentage: paymentPercentage
        }
      };
      if (auth?.user && saveProfile) {
        try {
          await axios.post("/checkout/save-profile", {
            shipping: shippingInfo,
            billing: sameAsShipping ? shippingInfo : billingInfo
          });
        } catch (error) {
          console.error("Failed to save profile:", error);
        }
      }
      if (selectedPaymentMethod.type === "cash") {
        const response = await axios.post("/api/checkout/process", checkoutData);
        if (!response.data.success) {
          throw new Error(response.data.message || "Order failed");
        }
        const orderData = response.data.data?.order ?? null;
        setOrderSuccess({
          orderId: orderData?.id ?? null,
          wooOrderId: response.data.data?.woocommerce_order_id ?? null,
          total: orderData?.total ?? null,
          paymentMethod: selectedPaymentMethod.title,
          deliveryMethod,
          shipping: shippingInfo,
          billing: sameAsShipping ? shippingInfo : billingInfo,
          quantity: checkoutData.quantity,
          productTitle: product.title ?? "Order Item",
          productImage: product.images?.[0] ?? "/placeholder.png"
        });
        setLoading(false);
        return;
      }
      const tempReference = `SF-${Date.now()}`;
      setPendingOrderReference(tempReference);
      const paymentResponse = await axios.post("/api/payments/initiate", {
        provider: selectedPaymentMethod.id,
        amount: paymentAmount,
        reference: tempReference,
        email: shippingInfo.email,
        phone: selectedPaymentMethod.requires_phone ? ecocashPhone : shippingInfo.phone,
        description: `Order for ${product.title}${paymentPercentage === 75 ? " (75% deposit)" : ""}`,
        product_name: product.title,
        product_image: product.images?.[0],
        currency: "USD",
        payment_percentage: paymentPercentage,
        checkout_data: checkoutData
        // Include checkout data for payment-first flow
      });
      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || "Payment initialization failed");
      }
      if (paymentResponse.data.requires_redirect && paymentResponse.data.redirect_url) {
        setToastType("info");
        setToastMessage("Redirecting to payment page...");
        window.location.href = paymentResponse.data.redirect_url;
        return;
      }
      if (paymentResponse.data.poll_url) {
        setPaymentProcessing(true);
        setPaymentPollUrl(paymentResponse.data.poll_url);
        setPaymentMessage(paymentResponse.data.message || "Please complete payment on your phone...");
        setLoading(false);
        pollPaymentStatus(paymentResponse.data.poll_url, null, selectedPaymentMethod.title, tempReference);
        return;
      }
      throw new Error("Unexpected payment response");
    } catch (error) {
      setToastType("error");
      setToastMessage(error.response?.data?.message || error.message || "Failed to place order. Please try again.");
    } finally {
      if (!paymentProcessing) {
        setLoading(false);
      }
    }
  };
  const pollPaymentStatus = async (pollUrl, orderData, paymentMethodTitle, reference) => {
    const maxAttempts = 60;
    let attempts = 0;
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setPaymentProcessing(false);
        setPaymentMessage(null);
        setToastType("error");
        setToastMessage("Payment timeout. Please try again or contact support.");
        return;
      }
      try {
        const response = await axios.post("/api/payments/status", {
          provider: selectedPaymentMethod?.id,
          poll_url: pollUrl,
          reference
          // Pass reference for order lookup
        });
        if (response.data.paid) {
          setPaymentProcessing(false);
          setPaymentMessage(null);
          setToastType("success");
          setToastMessage("Payment received!");
          const finalOrderData = response.data.order ?? orderData;
          setOrderSuccess({
            orderId: finalOrderData?.id ?? null,
            wooOrderId: finalOrderData?.woocommerce_order_id ?? null,
            total: finalOrderData?.total ?? null,
            paymentMethod: paymentMethodTitle,
            deliveryMethod,
            shipping: shippingInfo,
            billing: sameAsShipping ? shippingInfo : billingInfo,
            quantity: 1,
            productTitle: product.title ?? "Order Item",
            productImage: product.images?.[0] ?? "/placeholder.png"
          });
          return;
        }
        attempts++;
        setTimeout(poll, 5e3);
      } catch (error) {
        console.error("Error polling payment status:", error);
        attempts++;
        setTimeout(poll, 5e3);
      }
    };
    poll();
  };
  if (orderSuccess) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Head, { title: "Order Successful" }),
      /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-neutral-50 dark:bg-neutral-950", children: [
        /* @__PURE__ */ jsx("header", { className: "bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white", children: /* @__PURE__ */ jsx("img", { src: "/images/logo.png", alt: "Storeflex", className: "h-8 w-auto" }) }),
          auth?.user && /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: auth.user.email })
        ] }) }),
        /* @__PURE__ */ jsx("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 py-10", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-emerald-700 dark:text-[#86efac]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: "Order successfully placed" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Thanks for your purchase. We are processing your order now." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: [
              orderSuccess.orderId != null && /* @__PURE__ */ jsxs("div", { children: [
                "Order #",
                orderSuccess.orderId
              ] }),
              orderSuccess.wooOrderId != null && /* @__PURE__ */ jsxs("div", { children: [
                "WooCommerce #",
                orderSuccess.wooOrderId
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-neutral-200 dark:border-neutral-800 p-4", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-neutral-900 dark:text-white mb-3", children: "Order summary" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: orderSuccess.productImage,
                      alt: orderSuccess.productTitle,
                      className: "w-16 h-16 rounded-lg object-contain bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-neutral-900 dark:text-white", children: orderSuccess.productTitle }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: [
                      "Qty: ",
                      orderSuccess.quantity
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-neutral-900 dark:text-white", children: orderSuccess.total != null ? `USD $${orderSuccess.total}` : "Paid" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2", children: "Shipping" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-900 dark:text-white", children: [
                    orderSuccess.shipping.first_name,
                    " ",
                    orderSuccess.shipping.last_name
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: orderSuccess.shipping.address_1 || "Pickup order" }),
                  orderSuccess.shipping.city && /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: [
                    orderSuccess.shipping.city,
                    " ",
                    orderSuccess.shipping.postcode
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: orderSuccess.shipping.email })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2", children: "Billing" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-900 dark:text-white", children: [
                    orderSuccess.billing.first_name,
                    " ",
                    orderSuccess.billing.last_name
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: orderSuccess.billing.address_1 || "Pickup order" }),
                  orderSuccess.billing.city && /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: [
                    orderSuccess.billing.city,
                    " ",
                    orderSuccess.billing.postcode
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: orderSuccess.billing.email })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-neutral-900 dark:text-white", children: "Payment & delivery" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { children: "Payment" }),
                  /* @__PURE__ */ jsx("span", { className: "text-neutral-900 dark:text-white", children: orderSuccess.paymentMethod })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-2", children: [
                  /* @__PURE__ */ jsx("span", { children: "Delivery" }),
                  /* @__PURE__ */ jsx("span", { className: "text-neutral-900 dark:text-white", children: orderSuccess.deliveryMethod === "pickup" ? "Pickup" : "Delivery" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-2", children: [
                  /* @__PURE__ */ jsx("span", { children: "Total" }),
                  /* @__PURE__ */ jsx("span", { className: "text-neutral-900 dark:text-white", children: orderSuccess.total != null ? `USD $${orderSuccess.total}` : "Paid" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2", children: [
                auth?.user ? /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: "/dashboard",
                    className: "inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors",
                    children: "View dashboard"
                  }
                ) : /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: "/",
                    className: "inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors",
                    children: "Back to home"
                  }
                ),
                auth?.user && /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: "/orders",
                    className: "inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                    children: "View order history"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/product/${identifier}`,
                    className: "inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                    children: "Back to product"
                  }
                )
              ] })
            ] })
          ] })
        ] }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Checkout" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-neutral-50 dark:bg-neutral-950", children: [
      /* @__PURE__ */ jsx("header", { className: "bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center gap-2.5 font-bold text-xl text-neutral-900 dark:text-white", children: /* @__PURE__ */ jsx("img", { src: "/images/logo.png", alt: "Storeflex", className: "h-8 w-auto" }) }),
        auth?.user && /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: auth.user.email })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-neutral-900 dark:text-white mb-2", children: auth?.user ? "Complete Your Purchase" : "Guest Checkout" }),
          !auth?.user && /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mb-6", children: [
            "Have an account? ",
            /* @__PURE__ */ jsx(Link, { href: "/login", className: "text-emerald-600 dark:text-[#86efac] hover:underline", children: "Sign in" }),
            " for faster checkout"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-8 mt-6", children: ["shipping", "billing", "payment"].map((s, i) => {
            const stepNames = { shipping: "Shipping", billing: "Billing", payment: "Payment" };
            const currentIndex = ["shipping", "billing", "payment"].indexOf(step);
            const isActive = step === s;
            const isComplete = i < currentIndex;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
                /* @__PURE__ */ jsx("div", { className: `flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-colors ${isActive ? "bg-[#86efac] text-neutral-900" : isComplete ? "bg-emerald-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"}`, children: isComplete ? /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: /* @__PURE__ */ jsx("polyline", { points: "20 6 9 17 4 12" }) }) : i + 1 }),
                /* @__PURE__ */ jsx("span", { className: `text-xs mt-1 font-medium ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`, children: stepNames[s] })
              ] }),
              i < 2 && /* @__PURE__ */ jsx("div", { className: `flex-1 h-0.5 mx-2 ${isComplete ? "bg-emerald-600" : "bg-neutral-200 dark:bg-neutral-700"}` })
            ] }, s);
          }) }),
          step === "shipping" && /* @__PURE__ */ jsxs(Fragment, { children: [
            showSavedDetailsCard && hasSavedDetails && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white mb-4", children: "Welcome back!" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mb-4", children: "Use your saved details for faster checkout" }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  onClick: () => {
                    setUseExpressCheckout(true);
                    setStep("payment");
                  },
                  className: `p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${useExpressCheckout ? "border-[#86efac] bg-[#86efac]/10" : "border-neutral-200 dark:border-neutral-700 hover:border-[#86efac]/50"}`,
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-emerald-600 dark:text-[#86efac]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                        /* @__PURE__ */ jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
                        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "7", r: "4" })
                      ] }) }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsxs("p", { className: "font-semibold text-neutral-900 dark:text-white", children: [
                          savedCheckoutData.shipping?.first_name,
                          " ",
                          savedCheckoutData.shipping?.last_name
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: savedCheckoutData.shipping?.email }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: savedCheckoutData.shipping?.phone }),
                        savedCheckoutData.shipping?.address_1 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-500 dark:text-neutral-400 mt-1", children: [
                          savedCheckoutData.shipping?.address_1,
                          ", ",
                          savedCheckoutData.shipping?.city,
                          ", ",
                          savedCheckoutData.shipping?.country
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-emerald-600 dark:text-[#86efac] bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full", children: "Express" }),
                      /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-neutral-400", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("polyline", { points: "9 18 15 12 9 6" }) })
                    ] })
                  ] })
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setShowSavedDetailsCard(false);
                    setUseExpressCheckout(false);
                  },
                  className: "mt-3 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                      /* @__PURE__ */ jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
                      /* @__PURE__ */ jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
                    ] }),
                    "Enter different details"
                  ]
                }
              )
            ] }),
            (!showSavedDetailsCard || !hasSavedDetails) && /* @__PURE__ */ jsxs("form", { onSubmit: handleShippingSubmit, className: "space-y-4", children: [
              hasSavedDetails && !showSavedDetailsCard && /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setShowSavedDetailsCard(true),
                  className: "mb-4 text-sm text-emerald-600 dark:text-[#86efac] hover:underline flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("polyline", { points: "15 18 9 12 15 6" }) }),
                    "Use saved details instead"
                  ]
                }
              ),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white mb-4", children: deliveryMethod === "delivery" ? "Shipping Information" : "Contact Information" }),
              /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3", children: "Delivery Method" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs(
                    "label",
                    {
                      className: `flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${deliveryMethod === "pickup" ? "border-[#86efac] bg-[#86efac]/10" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`,
                      children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "radio",
                            name: "deliveryMethod",
                            value: "pickup",
                            checked: deliveryMethod === "pickup",
                            onChange: () => setDeliveryMethod("pickup"),
                            className: "w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-neutral-600 dark:text-neutral-400", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                            /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
                            /* @__PURE__ */ jsx("polyline", { points: "9 22 9 12 15 12 15 22" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx("div", { className: "font-medium text-neutral-900 dark:text-white", children: "Pickup" }),
                            /* @__PURE__ */ jsx("div", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "Collect from our location" })
                          ] })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "label",
                    {
                      className: `flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${deliveryMethod === "delivery" ? "border-[#86efac] bg-[#86efac]/10" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`,
                      children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "radio",
                            name: "deliveryMethod",
                            value: "delivery",
                            checked: deliveryMethod === "delivery",
                            onChange: () => setDeliveryMethod("delivery"),
                            className: "w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-neutral-600 dark:text-neutral-400", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                            /* @__PURE__ */ jsx("rect", { x: "1", y: "3", width: "15", height: "13" }),
                            /* @__PURE__ */ jsx("polygon", { points: "16 8 20 8 23 11 23 16 16 16 16 8" }),
                            /* @__PURE__ */ jsx("circle", { cx: "5.5", cy: "18.5", r: "2.5" }),
                            /* @__PURE__ */ jsx("circle", { cx: "18.5", cy: "18.5", r: "2.5" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx("div", { className: "font-medium text-neutral-900 dark:text-white", children: "Delivery" }),
                            /* @__PURE__ */ jsx("div", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "Ship to your address" })
                          ] })
                        ] })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3", children: "Shipping Speed" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs(
                    "label",
                    {
                      className: `flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${shippingSpeed === "regular" ? "border-[#86efac] bg-[#86efac]/10" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`,
                      children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "radio",
                            name: "shippingSpeed",
                            value: "regular",
                            checked: shippingSpeed === "regular",
                            onChange: () => setShippingSpeed("regular"),
                            className: "w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("div", { className: "font-medium text-neutral-900 dark:text-white", children: "Regular" }),
                          /* @__PURE__ */ jsx("div", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "Free" })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "label",
                    {
                      className: `flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${shippingSpeed === "express" ? "border-[#86efac] bg-[#86efac]/10" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`,
                      children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "radio",
                            name: "shippingSpeed",
                            value: "express",
                            checked: shippingSpeed === "express",
                            onChange: () => setShippingSpeed("express"),
                            className: "w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { children: [
                          /* @__PURE__ */ jsx("div", { className: "font-medium text-neutral-900 dark:text-white", children: "Express" }),
                          /* @__PURE__ */ jsx("div", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "$5 extra" })
                        ] })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "First Name" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: shippingInfo.first_name,
                      onChange: (e) => setShippingInfo({ ...shippingInfo, first_name: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Last Name" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: shippingInfo.last_name,
                      onChange: (e) => setShippingInfo({ ...shippingInfo, last_name: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "email",
                    required: true,
                    value: shippingInfo.email,
                    onChange: (e) => setShippingInfo({ ...shippingInfo, email: e.target.value }),
                    className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Phone" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "tel",
                    required: true,
                    value: shippingInfo.phone,
                    onChange: (e) => setShippingInfo({ ...shippingInfo, phone: e.target.value }),
                    className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                  }
                )
              ] }),
              deliveryMethod === "pickup" && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "City" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    required: true,
                    value: shippingInfo.city,
                    onChange: (e) => setShippingInfo({ ...shippingInfo, city: e.target.value }),
                    className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Select a city" }),
                      /* @__PURE__ */ jsx("option", { value: "Harare", children: "Harare" }),
                      /* @__PURE__ */ jsx("option", { value: "Bulawayo", children: "Bulawayo" }),
                      /* @__PURE__ */ jsx("option", { value: "Chitungwiza", children: "Chitungwiza" }),
                      /* @__PURE__ */ jsx("option", { value: "Mutare", children: "Mutare" }),
                      /* @__PURE__ */ jsx("option", { value: "Gweru", children: "Gweru" }),
                      /* @__PURE__ */ jsx("option", { value: "Kwekwe", children: "Kwekwe" }),
                      /* @__PURE__ */ jsx("option", { value: "Kadoma", children: "Kadoma" }),
                      /* @__PURE__ */ jsx("option", { value: "Masvingo", children: "Masvingo" }),
                      /* @__PURE__ */ jsx("option", { value: "Victoria Falls", children: "Victoria Falls" }),
                      /* @__PURE__ */ jsx("option", { value: "Hwange", children: "Hwange" }),
                      /* @__PURE__ */ jsx("option", { value: "Marondera", children: "Marondera" }),
                      /* @__PURE__ */ jsx("option", { value: "Chinhoyi", children: "Chinhoyi" })
                    ]
                  }
                )
              ] }),
              deliveryMethod === "delivery" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Address Line 1" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: shippingInfo.address_1,
                      onChange: (e) => setShippingInfo({ ...shippingInfo, address_1: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Address Line 2 (Optional)" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: shippingInfo.address_2,
                      onChange: (e) => setShippingInfo({ ...shippingInfo, address_2: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "City" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        required: true,
                        value: shippingInfo.city,
                        onChange: (e) => setShippingInfo({ ...shippingInfo, city: e.target.value }),
                        className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "State/Province (Optional)" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        value: shippingInfo.state,
                        onChange: (e) => setShippingInfo({ ...shippingInfo, state: e.target.value }),
                        className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Postal Code" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        required: true,
                        value: shippingInfo.postcode,
                        onChange: (e) => setShippingInfo({ ...shippingInfo, postcode: e.target.value }),
                        className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Country Code" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        required: true,
                        value: shippingInfo.country,
                        onChange: (e) => setShippingInfo({ ...shippingInfo, country: e.target.value }),
                        className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent",
                        placeholder: "ZW"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-4", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/product/${identifier}`,
                    className: "px-6 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors",
                    children: "Back to Product"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    className: "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 text-white font-medium rounded-lg transition-colors",
                    children: "Continue to Billing"
                  }
                )
              ] })
            ] })
          ] }),
          step === "billing" && /* @__PURE__ */ jsxs("form", { onSubmit: handleBillingSubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white mb-4", children: "Billing Information" }),
            deliveryMethod === "delivery" && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: sameAsShipping,
                  onChange: (e) => setSameAsShipping(e.target.checked),
                  className: "w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-700 dark:text-neutral-300", children: "Same as shipping address" })
            ] }),
            (deliveryMethod === "pickup" || !sameAsShipping) && /* @__PURE__ */ jsxs("div", { className: "space-y-4 mt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "First Name" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: billingInfo.first_name,
                      onChange: (e) => setBillingInfo({ ...billingInfo, first_name: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Last Name" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: billingInfo.last_name,
                      onChange: (e) => setBillingInfo({ ...billingInfo, last_name: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "email",
                    required: true,
                    value: billingInfo.email,
                    onChange: (e) => setBillingInfo({ ...billingInfo, email: e.target.value }),
                    className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Phone" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "tel",
                    required: true,
                    value: billingInfo.phone,
                    onChange: (e) => setBillingInfo({ ...billingInfo, phone: e.target.value }),
                    className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Address Line 1" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: billingInfo.address_1,
                    onChange: (e) => setBillingInfo({ ...billingInfo, address_1: e.target.value }),
                    className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Address Line 2 (Optional)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: billingInfo.address_2,
                    onChange: (e) => setBillingInfo({ ...billingInfo, address_2: e.target.value }),
                    className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "City" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: billingInfo.city,
                      onChange: (e) => setBillingInfo({ ...billingInfo, city: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "State/Province (Optional)" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: billingInfo.state,
                      onChange: (e) => setBillingInfo({ ...billingInfo, state: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Postal Code" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: billingInfo.postcode,
                      onChange: (e) => setBillingInfo({ ...billingInfo, postcode: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1", children: "Country Code" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      required: true,
                      value: billingInfo.country,
                      onChange: (e) => setBillingInfo({ ...billingInfo, country: e.target.value }),
                      className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent",
                      placeholder: "ZW"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setStep("shipping"),
                  className: "px-6 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors",
                  children: "Back"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  className: "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 text-white font-medium rounded-lg transition-colors",
                  children: "Continue to Payment"
                }
              )
            ] })
          ] }),
          step === "payment" && /* @__PURE__ */ jsxs("form", { onSubmit: handlePlaceOrder, className: "space-y-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white mb-4", children: "Payment & Agent" }),
            useExpressCheckout && hasSavedDetails && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 mb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4 text-emerald-600 dark:text-[#86efac]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                    /* @__PURE__ */ jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
                    /* @__PURE__ */ jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
                  ] }),
                  "Using saved details"
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setUseExpressCheckout(false);
                      setShowSavedDetailsCard(false);
                      setStep("shipping");
                    },
                    className: "text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors",
                    children: "Edit"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: [
                shippingInfo.first_name,
                " ",
                shippingInfo.last_name,
                " • ",
                shippingInfo.email,
                " • ",
                shippingInfo.phone
              ] }),
              shippingInfo.address_1 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 dark:text-neutral-500 mt-1", children: [
                shippingInfo.address_1,
                ", ",
                shippingInfo.city,
                ", ",
                shippingInfo.country
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2", children: "Select Agent" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  required: true,
                  value: selectedAgent?.ID || "",
                  onChange: (e) => setSelectedAgent(agents.find((a) => a.ID === e.target.value) || null),
                  className: "w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#86efac] focus:border-transparent",
                  children: agents.map((agent) => /* @__PURE__ */ jsx("option", { value: agent.ID, children: agent.display_name }, agent.ID))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2", children: "Payment Method" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2", children: paymentMethods.map((method) => /* @__PURE__ */ jsxs(
                "label",
                {
                  className: `flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPaymentMethod?.id === method.id ? "border-[#86efac] bg-[#86efac]/10" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "radio",
                        name: "payment",
                        value: method.id,
                        checked: selectedPaymentMethod?.id === method.id,
                        onChange: () => setSelectedPaymentMethod(method),
                        className: "w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1", children: [
                      /* @__PURE__ */ jsxs("div", { className: "w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center", children: [
                        method.icon === "ecocash" && /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-green-600", children: "EC" }),
                        method.icon === "paynow" && /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-blue-600", children: "PN" }),
                        method.icon === "paypal" && /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-blue-500", children: "PP" }),
                        method.icon === "stripe" && /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-purple-600", children: "S" }),
                        method.icon === "cash" && /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" }) }),
                        !method.icon && /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-neutral-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                        /* @__PURE__ */ jsxs("div", { className: "font-medium text-neutral-900 dark:text-white flex items-center gap-2", children: [
                          method.title,
                          method.type === "mobile_push" && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", children: "Mobile" })
                        ] }),
                        method.description && /* @__PURE__ */ jsx("div", { className: "text-sm text-neutral-500 dark:text-neutral-400 mt-0.5", children: method.description })
                      ] })
                    ] })
                  ]
                },
                method.id
              )) })
            ] }),
            selectedPaymentMethod?.requires_phone && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-green-800 dark:text-green-300 mb-2", children: "EcoCash Phone Number" }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "tel",
                  value: ecocashPhone,
                  onChange: (e) => setEcocashPhone(e.target.value.replace(/[^0-9]/g, "")),
                  placeholder: "077 123 4567",
                  className: "flex-1 px-4 py-2.5 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent",
                  maxLength: 10
                }
              ) }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-green-600 dark:text-green-400 mt-2", children: "A USSD prompt will be sent to this number to complete payment" })
            ] }),
            paymentProcessing && /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { className: "w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-medium text-blue-900 dark:text-blue-100", children: "Waiting for payment..." }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 dark:text-blue-300 mt-1", children: paymentMessage || "Please complete payment on your phone" })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setPaymentProcessing(false);
                    setPaymentMessage(null);
                    setPaymentPollUrl(null);
                  },
                  className: "mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline",
                  children: "Cancel and try another method"
                }
              )
            ] }),
            auth?.user && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: saveProfile,
                  onChange: (e) => setSaveProfile(e.target.checked),
                  className: "w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-emerald-600 focus:ring-2 focus:ring-[#86efac]"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-neutral-700 dark:text-neutral-300", children: "Save this information for faster checkout next time" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    if (useExpressCheckout) {
                      setShowSavedDetailsCard(true);
                      setStep("shipping");
                    } else {
                      setStep("billing");
                    }
                  },
                  disabled: paymentProcessing,
                  className: "px-6 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50",
                  children: "Back"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: loading || paymentProcessing,
                  className: "px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                  children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 animate-spin", viewBox: "0 0 24 24", fill: "none", children: [
                      /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                      /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                    ] }),
                    "Processing..."
                  ] }) : selectedPaymentMethod?.type === "cash" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
                    "Place Order"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" }) }),
                    "Proceed to Payment"
                  ] })
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 sticky top-8", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white mb-4", children: "Order Summary" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: product.images?.[0] || "/placeholder.png",
                alt: product.title,
                className: "w-20 h-20 object-contain rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-neutral-900 dark:text-white line-clamp-2", children: product.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400 mt-1", children: "Qty: 1" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Subtotal" }),
              /* @__PURE__ */ jsxs("span", { className: "text-neutral-900 dark:text-white font-medium", children: [
                "$",
                basePrice.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-neutral-600 dark:text-neutral-400", children: "Shipping" }),
              /* @__PURE__ */ jsx("span", { className: "text-neutral-900 dark:text-white font-medium", children: shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : "Free" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-neutral-200 dark:border-neutral-800", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: "Total" }),
            /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold text-emerald-600 dark:text-[#86efac]", children: [
              "USD $",
              totalPrice.toFixed(2)
            ] })
          ] }) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      Toast,
      {
        message: toastMessage,
        type: toastType,
        onDismiss: () => setToastMessage(null)
      }
    ),
    showPaymentPercentageModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-neutral-200 dark:border-neutral-800", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-neutral-900 dark:text-white", children: "Choose Payment Amount" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400 mt-1", children: "Select how much you'd like to pay now" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedPaymentPercentage(100),
            className: `w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPaymentPercentage === 100 ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`,
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-neutral-900 dark:text-white", children: "Pay in Full (100%)" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-neutral-600 dark:text-neutral-400 mt-0.5", children: "Complete payment now - no balance remaining" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold text-emerald-600 dark:text-[#86efac]", children: [
                "$",
                totalPrice.toFixed(2)
              ] }) })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedPaymentPercentage(75),
            className: `w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPaymentPercentage === 75 ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`,
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-neutral-900 dark:text-white", children: "Pay Deposit (75%)" }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-neutral-600 dark:text-neutral-400 mt-0.5", children: [
                  "Pay $",
                  (totalPrice * 0.25).toFixed(2),
                  " remaining on delivery"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold text-emerald-600 dark:text-[#86efac]", children: [
                  "$",
                  (totalPrice * 0.75).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-neutral-500 dark:text-neutral-500", children: [
                  "+ $",
                  (totalPrice * 0.25).toFixed(2),
                  " later"
                ] })
              ] })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowPaymentPercentageModal(false),
            className: "flex-1 px-4 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => processOrderWithPayment(selectedPaymentPercentage),
            className: "flex-1 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-[#86efac] dark:hover:bg-emerald-400 dark:text-neutral-900 rounded-lg transition-colors",
            children: "Continue to Payment"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  Checkout as default
};
