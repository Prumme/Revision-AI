<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits } from "vue";
import { fetchSubscriptionProducts } from "@/services/subscription.service";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import CheckoutPlanCard from "@/components/checkout/CheckoutPlanCard.vue";

const props = defineProps<{ selectedPlan: SubscriptionInfo | null }>();
const emit = defineEmits<(event: "select-plan", plan: SubscriptionInfo) => void>();

const products = ref<SubscriptionInfo[]>([]);
const loading = ref(true);

// Computed pour filtrer seulement les plans payants (Basic et Pro)
const availablePlans = computed(() => {
  return products.value.filter(
    (product) =>
      product.productName.toLowerCase() === "basic" || product.productName.toLowerCase() === "pro",
  );
});

const handlePlanSelect = (plan: SubscriptionInfo) => {
  emit("select-plan", plan);
};

onMounted(async () => {
  try {
    loading.value = true;
    const data = await fetchSubscriptionProducts();
    products.value = data.products || [];
  } catch (error) {
    // Gérer l'erreur ici si besoin
    console.error("Erreur lors de la récupération des produits:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h2 class="font-encode text-2xl font-bold text-black">Choisissez votre plan</h2>
      <p class="font-outfit text-gray-600">
        Sélectionnez le plan qui correspond le mieux à vos besoins de révision.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="i in 2" :key="i" class="animate-pulse bg-gray-200 rounded-lg h-96"></div>
    </div>

    <!-- Plans grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CheckoutPlanCard
        v-for="plan in availablePlans"
        :key="plan.productId"
        :plan="plan"
        :is-selected="props.selectedPlan?.productId === plan.productId"
        @select="handlePlanSelect"
      />
    </div>

    <!-- Empty state -->
    <div v-if="!loading && availablePlans.length === 0" class="text-center py-12">
      <p class="font-outfit text-gray-500">
        Aucun plan disponible pour le moment. Veuillez réessayer plus tard.
      </p>
    </div>

    <!-- Selection summary -->
    <div v-if="props.selectedPlan" class="bg-primary/5 border border-primary/20 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-outfit font-semibold text-black">Plan sélectionné :</h3>
          <p class="font-outfit text-primary font-medium">
            {{ props.selectedPlan.productName.toUpperCase() }} -
            {{ (props.selectedPlan.amount / 100).toFixed(2) }}€ /
            {{ props.selectedPlan.recurringInterval === "month" ? "mois" : "an" }}
          </p>
        </div>
        <div class="text-right">
          <p class="font-outfit text-sm text-gray-600">Vous pouvez modifier ce choix</p>
          <p class="font-outfit text-sm text-gray-600">dans les étapes suivantes</p>
        </div>
      </div>
    </div>
  </div>
</template>
