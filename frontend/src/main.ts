import "./style.css";

import {createApp} from "vue";
import {createPinia} from "pinia";

import App from "./App.vue";
import router from "./router";
import CookieConsentVue from './plugins/CookieConsentVue';

// Types pour CookieConsent
interface CookieConsentAPI {
  getCookie(): CookieData;

  run(config: Record<string, unknown>): void;
}

interface CookieData {
  categories: string[];

  [key: string]: unknown;
}

declare global {
  interface Window {
    CookieConsent: CookieConsentAPI;
    _paq: Array<Array<string | number>>;
  }
}

const setupMatomo = (): void => {
  console.log("SETUP MATOMO DEPENDING ON COOKIE CONSENT");
  let url = import.meta.env.VITE_MATOMO_URL || "http://localhost:8080/matomo";
  url = url.replace('http://', '//').replace('https://', '//');
  url = url.endsWith('/') ? url : url + '/';

  const _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);

  (function () {
    const u = url;
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', '1']);
    const d: Document = document;
    const g: HTMLScriptElement = d.createElement('script');
    const s: Element | null = d.getElementsByTagName('script')[0];
    g.async = true;
    g.src = u + 'matomo.js';
    if (s?.parentNode) {
      s.parentNode.insertBefore(g, s);
    }
  })();

  router.afterEach((to, from) => {
    if (to.path !== from.path) {
      window._paq.push(['setCustomUrl', to.fullPath]);
      window._paq.push(['trackPageView']);
    }
  });
};

const checkAnalyticsAndSetupMatomo = (): void => {
  try {
    const acceptedCategories: CookieData = window.CookieConsent.getCookie();
    console.log('Accepted categories:', acceptedCategories);
    if (acceptedCategories.categories.includes('analytics')) {
      setupMatomo();
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error checking cookie consent:', error.message);
    } else {
      console.error('Unknown error checking cookie consent:', error);
    }
  }
};

const app = createApp(App);

app.use(CookieConsentVue, {
  categories: {
    necessary: {
      enabled: true,
      readOnly: true
    },
    analytics: {}
  },
  language: {
    default: 'fr',
    translations: {
      fr: {
        consentModal: {
          title: 'Votre vie privée, notre priorité',
          description: 'Nous utilisons des cookies pour garantir le bon fonctionnement du site, personnaliser votre expérience et analyser notre trafic. Vous pouvez choisir les cookies que vous souhaitez autoriser.',
          acceptAllBtn: 'Accepter tous les cookies',
          acceptNecessaryBtn: 'Refuser les cookies optionnels',
          showPreferencesBtn: 'Personnaliser mes choix'
        },
        preferencesModal: {
          title: 'Préférences de confidentialité',
          acceptAllBtn: 'Accepter tous les cookies',
          acceptNecessaryBtn: 'Refuser les cookies optionnels',
          savePreferencesBtn: 'Enregistrer mes préférences',
          closeIconLabel: 'Fermer la fenêtre',
          sections: [
            {
              title: 'Pourquoi les cookies ?',
              description: 'Nous utilisons différents types de cookies pour optimiser votre navigation et améliorer notre service.'
            },
            {
              title: 'Cookies strictement nécessaires',
              description: 'Ces cookies sont indispensables au bon fonctionnement du site. Ils sont activés en permanence.',
              linkedCategory: 'necessary'
            },
            {
              title: 'Cookies de performance et d\'analyse',
              description: 'Ces cookies nous permettent de mieux comprendre comment le site est utilisé et d\'améliorer son contenu. Toutes les données collectées sont anonymes.',
              linkedCategory: 'analytics'
            },
            {
              title: 'Besoin d\'aide ?',
              description: 'Pour en savoir plus sur l\'utilisation des cookies ou exercer vos droits, contactez-nous.'
            }
          ]
        }
      }
    }
  },
  onAccept: (): void => {
    console.log('Cookies accepted');
    checkAnalyticsAndSetupMatomo();
  },
  onFirstAccept: (): void => {
    console.log('First time cookies accepted');
    checkAnalyticsAndSetupMatomo();
  },
  onChange: (): void => {
    console.log('Cookie preferences changed');
    checkAnalyticsAndSetupMatomo();
  }
});

app.use(createPinia());
app.use(router);
app.mount("#app");
