<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";
import { useSubscriptionStore } from "@/stores/subscription";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import CheckoutPlanCard from "@/components/checkout/CheckoutPlanCard.vue";

const props = defineProps<{ selectedPlan: SubscriptionInfo | null }>();
const emit = defineEmits<(event: "select-plan", plan: SubscriptionInfo) => void>();

const subscriptionStore = useSubscriptionStore();

const availablePlans = computed(() => {
  if (!subscriptionStore.products) return [];
  return subscriptionStore.products.filter(
    (product) =>
      product.productName.toLowerCase() === "basic" ||
      product.productName.toLowerCase() === "pro",
  );
});

const handlePlanSelect = (plan: SubscriptionInfo) => {
  emit("select-plan", plan);
};
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

    <!-- Error state -->
    <div v-if="subscriptionStore.error" class="bg-error/10 border border-error text-error rounded-lg p-4 mb-2">
      <p class="font-outfit font-medium">{{ subscriptionStore.error }}</p>
    </div>

    <!-- Loading state -->
    <div v-if="subscriptionStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <div v-if="!subscriptionStore.loading && availablePlans.length === 0" class="text-center py-12">
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
