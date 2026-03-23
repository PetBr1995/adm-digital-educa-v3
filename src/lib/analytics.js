const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

let initialized = false;

export function isAnalyticsEnabled() {
  return typeof window !== "undefined" && Boolean(GA_MEASUREMENT_ID);
}

export function initAnalytics() {
  if (!isAnalyticsEnabled() || initialized) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  initialized = true;
}

export function trackPageView(path, title = document.title) {
  if (!isAnalyticsEnabled()) return;
  initAnalytics();

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

export function trackEvent(eventName, params = {}) {
  if (!isAnalyticsEnabled()) return;
  initAnalytics();
  window.gtag("event", eventName, params);
}

export function setUserProperties(properties = {}) {
  if (!isAnalyticsEnabled()) return;
  initAnalytics();

  window.gtag("set", "user_properties", properties);
}
