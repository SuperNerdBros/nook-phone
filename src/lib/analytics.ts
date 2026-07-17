/**
 * Analytics Manager
 * A nice wrapper around Google Analytics gtag to easily track events in the NookPhone.
 */

// Define the global window object properties for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const analytics = {
  /**
   * Tracks a pageview (or in our case, an app open)
   */
  trackAppOpen(appName: string) {
    if (typeof window.gtag !== 'function') return;
    
    window.gtag('event', 'app_open', {
      app_name: appName,
    });
    console.log(`[Analytics] App Opened: ${appName}`);
  },

  /**
   * Track specific phone interactions (unlocking, locking, settings changes)
   */
  trackInteraction(action: string, category: string = 'engagement', label?: string) {
    if (typeof window.gtag !== 'function') return;

    const params: any = { event_category: category };
    if (label) params.event_label = label;

    window.gtag('event', action, params);
    console.log(`[Analytics] Interaction: ${action} (${category}) ${label ? `- ${label}` : ''}`);
  },
  
  /**
   * Generic event tracker for any other custom metrics
   */
  trackEvent(eventName: string, params: Record<string, any> = {}) {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, params);
    console.log(`[Analytics] Event: ${eventName}`, params);
  }
};
