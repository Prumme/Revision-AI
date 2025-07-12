<script setup lang="ts">
import { computed } from "vue";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_LABELS,
  type SubscriptionTier,
} from "@/config/subscription.config";
import { CheckIcon, StarIcon } from "lucide-vue-next";

interface Props {
  plan: SubscriptionInfo;
  isSelected: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [plan: SubscriptionInfo];
}>();

const planFeatures = computed(() => {
  const tier = props.plan.productName.toLowerCase() as SubscriptionTier;
  return SUBSCRIPTION_FEATURES[tier] || [];
});

const planLabel = computed(() => {
  const tier = props.plan.productName.toLowerCase() as SubscriptionTier;
  return SUBSCRIPTION_LABELS[tier] || props.plan.productName.toUpperCase();
});

const isPopular = computed(() => {
  return props.plan.productName.toLowerCase() === "basic";
});

const formattedPrice = computed(() => {
  return (props.plan.amount / 100).toFixed(2);
});

const formattedPeriod = computed(() => {
  return props.plan.recurringInterval === "month" ? "mois" : "an";
});

const handleSelect = () => {
  window._paq.push(['trackEvent', 'Button', "select_plan"]);
  emit("select", props.plan);
};
</script>

<template>
  <div
    @click="handleSelect"
    class="relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg"
    :class="[
      isSelected
        ? 'border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]'
        : 'border-gray-200 hover:border-primary/50',
    ]"
  >
    <!-- Popular badge -->
    <div v-if="isPopular" class="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
      <div
        class="bg-primary text-black px-3 py-1 rounded-full text-xs font-outfit font-semibold flex items-center gap-1"
      >
        <StarIcon class="w-3 h-3" />
        Populaire
      </div>
    </div>

    <!-- Selection indicator -->
    <div
      v-if="isSelected"
      class="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
    >
      <CheckIcon class="w-4 h-4 text-white" />
    </div>

    <div class="p-6" :class="{ 'pt-8': isPopular }">
      <!-- Plan header -->
      <div class="text-center mb-6">
        <h3 class="font-encode text-xl font-bold text-black mb-2">
          {{ planLabel }}
        </h3>
        <div class="flex items-baseline justify-center gap-1">
          <span class="font-outfit text-4xl font-bold text-black"> {{ formattedPrice }}€ </span>
          <span class="font-outfit text-lg text-gray-600"> /{{ formattedPeriod }} </span>
        </div>
      </div>

      <!-- Features list -->
      <div class="space-y-3">
        <h4 class="font-outfit font-semibold text-gray-900 text-sm">Fonctionnalités incluses :</h4>
        <ul class="space-y-2">
          <li
            v-for="feature in planFeatures"
            :key="feature"
            class="flex items-start gap-2 text-sm text-gray-600"
          >
            <CheckIcon class="text-primary w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>

      <!-- Call to action -->
      <div class="mt-6">
        <button
          @click.stop="handleSelect"
          class="w-full font-outfit font-medium py-3 px-4 rounded-lg transition-all duration-200"
          :class="[
            isSelected
              ? 'bg-primary text-black border-2 border-black shadow-[0_4px_0_#000]'
              : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100',
          ]"
        >
          {{ isSelected ? "Plan sélectionné" : "Choisir ce plan" }}
        </button>
      </div>
    </div>
  </div>
</template>
