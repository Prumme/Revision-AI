<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { fetchSubscriptionProducts } from "@/services/subscription.service";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import type { User } from "@/types/user";
import { useRouter } from "vue-router";
import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_LABELS,
  type SubscriptionTier,
} from "@/config/subscription.config";
import { CheckIcon } from "lucide-vue-next";

interface Props {
  user: User | null;
}

const props = defineProps<Props>();
const router = useRouter();
const products = ref<SubscriptionInfo[]>([]);
const loading = ref(true);

const currentPlan = computed(() => {
  if (props.user?.subscriptionTier === "free") {
    return {
      name: SUBSCRIPTION_LABELS.free,
      price: "0€",
      period: "/mois",
      isFree: true,
    };
  }

  // Trouver le produit correspondant au tier actuel
  const product = products.value.find(
    (p) => p.productName.toLowerCase() === props.user?.subscriptionTier,
  );

  if (product) {
    return {
      name: product.productName.toUpperCase(),
      price: `${(product.amount / 100).toFixed(2)} €`,
      period: `/${product.recurringInterval === "month" ? "mois" : "an"}`,
      isFree: false,
    };
  }

  // Fallback
  return {
    name: SUBSCRIPTION_LABELS.free,
    price: "0€",
    period: "/mois",
    isFree: true,
  };
});

const currentPlanFeatures = computed(() => {
  const tier = props.user?.subscriptionTier || "free";
  return SUBSCRIPTION_FEATURES[tier as SubscriptionTier] || SUBSCRIPTION_FEATURES.free;
});

const canUpgrade = computed(() => props.user?.subscriptionTier !== "pro");

const handleUpgrade = () => {
  router.push("/subscription/checkout");
};

const handleCancelSubscription = () => {
  // TODO: Implémenter la logique de suppression d'abonnement
  console.log("Suppression d'abonnement à implémenter");
};

onMounted(async () => {
  try {
    const data = await fetchSubscriptionProducts();
    products.value = data.products || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div v-if="loading" class="animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <!-- Plan info -->
        <div class="flex items-center gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span
                class="px-3 py-1 text-xs font-outfit font-semibold rounded-full"
                :class="
                  currentPlan.isFree ? 'bg-gray-100 text-gray-700' : 'bg-primary/10 text-primary'
                "
              >
                {{ currentPlan.name }}
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="font-outfit text-3xl font-bold text-black">
                {{ currentPlan.price }}
              </span>
              <span v-if="currentPlan.period" class="font-outfit text-lg text-black-transparent">
                {{ currentPlan.period }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-3">
          <!-- Upgrade button -->
          <div v-if="canUpgrade">
            <button
              @click="handleUpgrade"
              class="bg-primary hover:bg-primary/90 text-white font-outfit font-medium px-6 py-2 rounded-lg transition-colors duration-150"
            >
              Améliorer mon offre
            </button>
          </div>

          <!-- Cancel subscription button -->
          <div v-if="!currentPlan.isFree">
            <button
              @click="handleCancelSubscription"
              class="bg-error/90 hover:bg-error text-white font-outfit font-medium px-6 py-2 rounded-lg transition-colors duration-150"
            >
              Résilier
            </button>
          </div>
        </div>
      </div>

      <!-- Plan features -->
      <div class="border-t pt-4 border-gray-200">
        <h4 class="font-outfit font-semibold text-gray-900 mb-3">Fonctionnalités incluses :</h4>
        <ul class="space-y-2">
          <li
            v-for="feature in currentPlanFeatures"
            :key="feature"
            class="flex items-center gap-2 text-sm text-gray-600"
          >
            <CheckIcon class="text-primary w-4 h-4 flex-shrink-0" />
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
