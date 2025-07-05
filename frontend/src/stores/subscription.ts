import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchSubscriptionProducts } from '@/services/subscription.service';
import type { SubscriptionInfo } from '@/types/subscriptionInfo';

export const useSubscriptionStore = defineStore('subscription', () => {
  const products = ref<SubscriptionInfo[] | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Récupère les plans d'abonnement, avec cache
  async function fetchProducts(force = false) {
    if (products.value && !force) return;
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchSubscriptionProducts();
      products.value = data.products || [];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur inconnue';
    } finally {
      loading.value = false;
    }
  }

  // Pour forcer le refresh
  function refresh() {
    products.value = null;
    return fetchProducts(true);
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    refresh,
  };
});
