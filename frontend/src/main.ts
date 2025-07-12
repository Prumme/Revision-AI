import "./style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";


function setupMatomo() {
    let url = import.meta.env.VITE_MATOMO_URL || "http://localhost:8080/matomo";
    url = url.replace('http://', '//').replace('https://', '//');
    url = url.endsWith('/') ? url : url + '/';
    //@ts-expect-error global variable
    const _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
        const u=url;
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '1']);
        const d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        // @ts-expect-error global variable
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
}

setupMatomo();
const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
