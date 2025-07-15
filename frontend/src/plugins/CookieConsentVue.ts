import "vanilla-cookieconsent/dist/cookieconsent.css";
import "../assets/cookies.css";
import * as CookieConsent from "vanilla-cookieconsent";
import { type App, inject } from "vue";

declare global {
  interface Window {
    CookieConsent: typeof CookieConsent;
    _paq: Array<Array<string | number>>;
  }
}
const key = "__cookieConsentApp__";
export function useCookieConsent(): typeof CookieConsent | null | undefined {
  return inject(key);
}

export default {
  install: (app: App, pluginConfig: CookieConsent.CookieConsentConfig): void => {
    app.config.globalProperties.$CookieConsent = CookieConsent;
    app.provide(key, app.config?.globalProperties?.$CookieConsent || null);
    window.CookieConsent = CookieConsent;

    CookieConsent.run({
      ...pluginConfig,
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom left",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "right",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
    });
  },
};
