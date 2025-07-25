<script setup lang="ts">
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";
import { CheckIcon } from "lucide-vue-next";
import { onMounted } from "vue";
import { useSubscriptionStore } from "@/stores/subscription";
import { SUBSCRIPTION_FEATURES, type SubscriptionTier } from "@/config/subscription.config";

const subscriptionStore = useSubscriptionStore();

onMounted(() => {
  subscriptionStore.fetchProducts();
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
            <li
              v-for="feature in SUBSCRIPTION_FEATURES.free"
              :key="feature"
              class="flex items-center gap-2"
            >
              <CheckIcon class="text-primary" />{{ feature }}
            </li>
          </ul>
          <RouterLink to="/register" class="mt-auto">
            <ButtonComponent tracking_event="landing_pricing_subscribe_cta" variant="secondary">
              S'inscrire
            </ButtonComponent>
          </RouterLink>
        </div>

        <!-- Boucle sur les produits Stripe -->
        <div
          v-for="product in subscriptionStore.products || []"
          :key="product.productId"
          class="relative rounded-2xl shadow p-8 flex flex-col h-full"
          :class="product.productName === 'basic' ? 'bg-primary' : ''"
        >
          <h3
            class="font-encode text-xl font-semibold mb-2 capitalize"
            :class="product.productName === 'basic' ? 'text-white' : ''"
          >
            {{ product.productName }}
          </h3>
          <div
            class="font-outfit text-3xl font-bold mb-1"
            :class="product.productName === 'basic' ? 'text-white' : 'text-primary'"
          >
            {{ (product.amount / 100).toFixed(2) }}&nbsp;€ / mois
          </div>
          <ul
            class="font-outfit text-sm mt-6 mb-6 space-y-4"
            :class="product.productName === 'basic' ? 'text-white' : 'text-gray-700'"
          >
            <li
              v-for="feature in SUBSCRIPTION_FEATURES[product.productName as SubscriptionTier]"
              :key="feature"
              class="flex items-center gap-2"
            >
              <CheckIcon :class="product.productName === 'basic' ? 'text-white' : 'text-primary'" />
              {{ feature }}
            </li>
          </ul>
          <RouterLink to="/register" class="mt-auto">
            <ButtonComponent
              :variant="product.productName === 'basic' ? 'secondary-inverted' : 'secondary'"
            >
              S'inscrire
            </ButtonComponent>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
