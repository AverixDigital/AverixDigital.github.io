(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");
  const body = document.body;
  const locale = root.lang === "en" ? "en" : "bn";
  const page = body.dataset.route || "home";
  const routeName = page === "family" ? "family-pro/" : page === "personal" ? "personal-pro/" : "";
  const localePath = locale === "en" ? "en/" : "";
  const currentPath = location.pathname.replace(/index\.html$/, "").replace(/\/*$/, "/");
  const expectedTail = localePath + routeName;
  const basePath = expectedTail ? currentPath.slice(0, -expectedTail.length) : currentPath;
  const siteBase = basePath.endsWith("/") ? basePath : basePath + "/";
  const absolute = (language, targetPage) => {
    const leaf = targetPage === "family" ? "family-pro/" : targetPage === "personal" ? "personal-pro/" : "";
    return new URL(siteBase + (language === "en" ? "en/" : "") + leaf, location.origin).href;
  };
  const languagePreferenceKey = "averixdigital-language";
  let savedLanguage = "";
  try { savedLanguage = localStorage.getItem(languagePreferenceKey) || ""; } catch (_) {}
  if ((savedLanguage === "bn" || savedLanguage === "en") && savedLanguage !== locale) {
    const preferredPage = absolute(savedLanguage, page);
    if (new URL(preferredPage).pathname !== currentPath) {
      location.replace(preferredPage);
      return;
    }
  }
  try { localStorage.setItem(languagePreferenceKey, locale); } catch (_) {}
  document.querySelectorAll("[data-language-link]").forEach(link => {
    link.addEventListener("click", () => {
      try { localStorage.setItem(languagePreferenceKey, link.dataset.languageLink); } catch (_) {}
    });
  });

  const canonical = absolute(locale, page);
  const setHref = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.href = value;
  };
  setHref('[data-seo="canonical"]', canonical);
  setHref('[data-seo="bn"]', absolute("bn", page));
  setHref('[data-seo="en"]', absolute("en", page));
  setHref('[data-seo="default"]', absolute("bn", page));
  const ogUrl = document.querySelector('[data-seo="og-url"]');
  if (ogUrl) ogUrl.content = canonical;
  const ogImage = document.querySelector('[data-seo="og-image"]');
  if (ogImage) ogImage.content = new URL(ogImage.content, location.href).href;
  const schema = document.querySelector("script[data-schema]");
  if (schema) {
    try {
      const value = JSON.parse(schema.textContent);
      value.url = canonical;
      if (value.offers) value.offers.url = canonical;
      schema.textContent = JSON.stringify(value);
    } catch (_) {}
  }

  const nav = document.querySelector("#primary-nav");
  const toggle = document.querySelector(".menu-toggle");
  const setMenu = open => {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? (locale === "bn" ? "মেনু বন্ধ করুন" : "Close menu") : (locale === "bn" ? "মেনু খুলুন" : "Open menu"));
  };
  if (nav && toggle) {
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("pointerdown", event => {
      if (toggle.getAttribute("aria-expanded") === "true" && !nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 901px)").matches) setMenu(false);
    });
  }
  document.querySelectorAll(".table-scroll").forEach(region => {
    region.addEventListener("keydown", event => {
      if (event.target !== region) return;
      let next = region.scrollLeft;
      const step = Math.max(96, Math.round(region.clientWidth * 0.72));
      if (event.key === "ArrowRight") next += step;
      else if (event.key === "ArrowLeft") next -= step;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = region.scrollWidth;
      else return;
      const max = region.scrollWidth - region.clientWidth;
      next = Math.max(0, Math.min(max, next));
      if (next !== region.scrollLeft) {
        event.preventDefault();
        region.scrollLeft = next;
      }
    });
  });
  document.querySelectorAll(".current-year").forEach(node => node.textContent = String(new Date().getFullYear()));
})();
