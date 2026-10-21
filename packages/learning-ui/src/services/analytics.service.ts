/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Window augmentation for gtag dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type ConsentStatus = 'accepted_all' | 'essential_only' | 'pending';

class AnalyticsService {
  private consentKey = 'los_cookie_consent';

  public getConsent(): ConsentStatus {
    try {
      const stored = localStorage.getItem(this.consentKey);
      if (stored === 'accepted_all' || stored === 'essential_only') {
        return stored;
      }
      return 'pending';
    } catch {
      return 'pending';
    }
  }

  public setConsent(status: 'accepted_all' | 'essential_only') {
    try {
      localStorage.setItem(this.consentKey, status);
      
      // Update Google Analytics consent mode
      if (typeof window !== 'undefined' && window.gtag) {
        if (status === 'accepted_all') {
          window.gtag('consent', 'update', {
            'analytics_storage': 'granted',
            'ad_storage': 'denied'
          });
          console.log('[LOS Analytics] Consent granted: telemetry & analytics enabled.');
        } else {
          window.gtag('consent', 'update', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
          });
          console.log('[LOS Analytics] Consent updated: strictly essential cookies enabled.');
        }
      }
    } catch (err) {
      console.warn('[LOS Analytics] Failed to persist consent status:', err);
    }
  }

  public trackPageView(pageName: string) {
    if (this.getConsent() !== 'accepted_all') return;

    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: pageName,
          page_location: window.location.href,
          page_path: window.location.hash || '/'
        });
      }
      console.log(`[LOS Analytics] PageView: ${pageName}`);
    } catch (err) {
      console.warn('[LOS Analytics] Error logging pageview:', err);
    }
  }

  public trackEvent(category: string, action: string, label?: string, value?: number) {
    if (this.getConsent() !== 'accepted_all') return;

    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value
        });
      }
      console.log(`[LOS Analytics] Event: ${category} -> ${action} (${label ?? ''})`);
    } catch (err) {
      console.warn('[LOS Analytics] Error logging event:', err);
    }
  }
}

export const analytics = new AnalyticsService();
