const dataLayerName = 'dataLayer';
let isInitialized = false;

function initAnalytics(gtmId) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('Analytics initialization skipped: window or document is undefined.');
    return;
  }
  if (isInitialized) return;
  if (!gtmId) throw new Error('GTM ID is required to initialize analytics');
  window[dataLayerName] = window[dataLayerName] || [];
  window[dataLayerName].push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  script.onerror = () => {
    console.error(`Failed to load GTM script: ${script.src}`);
    isInitialized = false;
  };
  (document.head || document.getElementsByTagName('head')[0]).appendChild(script);
  isInitialized = true;
}

function trackEvent(eventName, data = {}) {
  if (typeof window === 'undefined') {
    console.warn('Analytics tracking skipped: window is undefined.');
    return;
  }
  if (!isInitialized) {
    console.warn('Analytics not initialized. Please call initAnalytics(gtmId) before tracking events.');
    return;
  }
  if (!eventName) {
    console.warn('Event name is required to track an event.');
    return;
  }
  const eventObject = Object.assign({}, data, { event: eventName });
  window[dataLayerName].push(eventObject);
}

export { initAnalytics, trackEvent }