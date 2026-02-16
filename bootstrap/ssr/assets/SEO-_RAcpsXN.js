import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
const defaultMeta = {
  title: "Storeflex - Premium Dropshipping from Dubai to Zimbabwe",
  description: "Shop premium products from Dubai delivered to Zimbabwe. Storeflex offers fast, reliable dropshipping services with authentic products from Amazon UAE at competitive prices.",
  keywords: "dropshipping Zimbabwe, Dubai to Zimbabwe shipping, Amazon UAE products Zimbabwe, online shopping Zimbabwe, import from Dubai, Storeflex, Zimbabwe online store",
  image: "/images/og-image.jpg"
};
function SEO({
  title,
  description,
  keywords,
  image,
  type = "website"
}) {
  const pageTitle = title ? `${title} | Storeflex - Dubai to Zimbabwe Dropshipping` : defaultMeta.title;
  const pageDescription = description || defaultMeta.description;
  const pageKeywords = keywords || defaultMeta.keywords;
  const pageImage = image || defaultMeta.image;
  return /* @__PURE__ */ jsxs(Head, { title: pageTitle, children: [
    /* @__PURE__ */ jsx("meta", { name: "description", content: pageDescription }),
    /* @__PURE__ */ jsx("meta", { name: "keywords", content: pageKeywords }),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: pageTitle }),
    /* @__PURE__ */ jsx("meta", { property: "og:description", content: pageDescription }),
    /* @__PURE__ */ jsx("meta", { property: "og:type", content: type }),
    /* @__PURE__ */ jsx("meta", { property: "og:image", content: pageImage }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: pageTitle }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: pageDescription }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: pageImage })
  ] });
}
export {
  SEO as S
};
