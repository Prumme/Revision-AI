<script setup lang="ts">
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";
import { CheckIcon } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { fetchSubscriptionProducts } from "@/services/subscription.service";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";

const products = ref<SubscriptionInfo[]>([]);

const featuresMap: Record<string, string[]> = {
  Basic: [
    "Quiz illimités",
    "Taille fichier étendue (jusqu'à 50 Mo)",
    "Rappels intelligents",
    "Suivi de progression détaillé",
    "Génération par thème / niveau",
  ],
  Pro: [
    "Tout dans l'offre Basic",
    "Analyse avancée des cours",
    "Mode Révision Express",
    "Création de sessions de révision intelligentes",
    "Assistance prioritaire",
  ],
};

onMounted(async () => {
  const response = await fetchSubscriptionProducts();
  products.value = response.products;
  //console.log("Products fetched:", products.value);
});
</script>

<template>
  <section id="tarifs" class="py-16 bg-white">
    <div class="max-w-6xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-encode font-bold text-black text-center mb-12">
        Des abonnements pour tous les besoins
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <!-- Gratuit (toujours en dur) -->
        <div class="relative rounded-2xl shadow p-8 flex flex-col h-full">
          <h3 class="font-encode text-xl font-semibold mb-2">Gratuit</h3>
          <div class="font-outfit text-3xl font-bold mb-1 text-primary">0&nbsp;€ / mois</div>
          <ul class="font-outfit text-gray-700 text-sm mt-6 mb-6 space-y-4">
            <li class="flex items-center gap-2"><CheckIcon class="text-primary" />1 quiz / jour</li>
            <li class="flex items-center gap-2">
              <CheckIcon class="text-primary" />Fichier max 10 Mo
            </li>
            <li class="flex items-center gap-2">
              <CheckIcon class="text-primary" />Pas de rappel intelligent
            </li>
            <li class="flex items-center gap-2">
              <CheckIcon class="text-primary" />Historique limité
            </li>
          </ul>
          <RouterLink to="/register" class="mt-auto">
            <ButtonComponent variant="secondary"> S'inscrire </ButtonComponent>
          </RouterLink>
        </div>

        <!-- Boucle sur les produits Stripe -->
        <div
          v-for="product in products"
          :key="product.productId"
          class="relative rounded-2xl shadow p-8 flex flex-col h-full"
          :class="product.productName === 'Basic' ? 'bg-primary' : ''"
        >
          <h3
            class="font-encode text-xl font-semibold mb-2"
            :class="product.productName === 'Basic' ? 'text-white' : ''"
          >
            {{ product.productName }}
          </h3>
          <div
            class="font-outfit text-3xl font-bold mb-1"
            :class="product.productName === 'Basic' ? 'text-white' : 'text-primary'"
          >
            {{ (product.amount / 100).toFixed(2) }}&nbsp;€ / mois
          </div>
          <ul
            class="font-outfit text-sm mt-6 mb-6 space-y-4"
            :class="product.productName === 'Basic' ? 'text-white' : 'text-gray-700'"
          >
            <li
              v-for="feature in featuresMap[product.productName]"
              :key="feature"
              class="flex items-center gap-2"
            >
              <CheckIcon :class="product.productName === 'Basic' ? 'text-white' : 'text-primary'" />
              {{ feature }}
            </li>
          </ul>
          <RouterLink to="/register" class="mt-auto">
            <ButtonComponent
              :variant="product.productName === 'Basic' ? 'secondary-inverted' : 'secondary'"
            >
              S'inscrire
            </ButtonComponent>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
