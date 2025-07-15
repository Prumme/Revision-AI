import "vanilla-cookieconsent/dist/cookieconsent.css";
import "../assets/cookies.css";
import * as CookieConsent from "vanilla-cookieconsent";
import type { App } from 'vue';

// Types pour CookieConsent
interface CookieConsentAPI {
  getCookie(): CookieData;
  run(config: Record<string, unknown>): void;
}

interface CookieData {
  categories: string[];
  [key: string]: unknown;
}

interface PluginConfig {
  categories?: Record<string, unknown>;
  language?: Record<string, unknown>;
  onAccept?: () => void;
  onFirstAccept?: () => void;
  onChange?: () => void;
  [key: string]: unknown;
}

declare global {
  interface Window {
    CookieConsent: CookieConsentAPI;
    _paq: Array<Array<string | number>>;
  }
}

export default {
  install: (app: App, pluginConfig: PluginConfig): void => {
    app.config.globalProperties.$CookieConsent = CookieConsent;

    window.CookieConsent = CookieConsent;

    const { onAccept, onFirstAccept, onChange, ...cookieConfig } = pluginConfig;

    CookieConsent.run({
      ...cookieConfig,
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom left',
          equalWeightButtons: true,
          flipButtons: false
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false
        }
      },
      onAccept: (): void => {
        console.log('Cookies accepted - callback from plugin');
        if (onAccept) {
          onAccept();
        }
      },
      onFirstAccept: (): void => {
        console.log('First time cookies accepted - callback from plugin');
        if (onFirstAccept) {
          onFirstAccept();
        }
      },
      onChange: (): void => {
        console.log('Cookie preferences changed - callback from plugin');
        if (onChange) {
          onChange();
        }
      }
    });
  }
}
