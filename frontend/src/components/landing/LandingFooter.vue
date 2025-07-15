<script setup lang="ts">
import TwitterIcon from "@/components/icons/TwitterIcon.vue";
import { Instagram, Linkedin } from "lucide-vue-next";
import { useCookieConsent } from "@/plugins/CookieConsentVue.ts";

const links = [
  { label: "Contact", href: "/contact" },
  { label: "Mentions légales", href: "/legal" },
  { label: "CGU et CGV", href: "/terms" },
  { label: "Politique de confidentialité", href: "/privacy" },
];

const socials = [
  {
    label: "Twitter",
    href: "https://twitter.com/",
    icon: TwitterIcon,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: Linkedin,
  },
];

const cookieConsent = useCookieConsent();
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-8 mt-12">
    <div
      class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <!-- Logo mini -->
      <a href="/" class="flex items-center font-encode font-bold text-xl text-black">
        Revision<span class="text-primary">AI</span>
      </a>

      <!-- Liens rapides -->
      <nav class="flex flex-wrap gap-4 text-gray-600 font-outfit text-sm">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.href"
          class="hover:text-primary transition"
        >
          {{ link.label }}
        </a>
        <button type="button" @click="cookieConsent.showPreferences()">
          Manage cookie preferences
        </button>
      </nav>

      <!-- Réseaux sociaux -->
      <div class="flex gap-4">
        <a
          v-for="social in socials"
          :key="social.label"
          :href="social.href"
          class="text-gray-400 hover:text-primary transition"
          target="_blank"
          rel="noopener"
          :aria-label="social.label"
        >
          <component :is="social.icon" class="w-6 h-6" />
        </a>
      </div>
    </div>
    <div class="mt-6 text-center text-xs text-gray-400 font-outfit">
      © 2025 RevisionAI. Tous droits réservés.
    </div>
  </footer>
</template>
