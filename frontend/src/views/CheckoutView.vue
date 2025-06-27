<script setup lang="ts">
import { onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useCheckoutFlow } from "@/composables/useCheckoutFlow";
import CheckoutStepper from "@/components/checkout/CheckoutStepper.vue";
import PlanSelectionStep from "@/components/checkout/PlanSelectionStep.vue";
import BillingAddressStep from "@/components/checkout/BillingAddressStep.vue";
import PaymentMethodStep from "@/components/checkout/PaymentMethodStep.vue";

const router = useRouter();
const checkout = useCheckoutFlow();

// Placeholder components pour les étapes restantes (à créer dans les prochaines étapes)
const OrderSummaryStep = {
  template:
    "<div class='p-8 bg-gray-50 rounded-lg text-center'><h3 class='font-outfit text-xl'>Étape 4: Récapitulatif</h3><p class='text-gray-600 mt-2'>À implémenter dans l'étape 5</p></div>",
};

const handleStepNavigation = (stepIndex: number) => {
  checkout.goToStep(stepIndex);
};

const handleNext = () => {
  checkout.goToNextStep();
};

const handlePrevious = () => {
  checkout.goToPreviousStep();
};

const handleCancel = () => {
  checkout.resetCheckout();
  router.push("/subscription");
};

// Nettoyage au démontage
onUnmounted(() => {
  // On peut garder les données en cas de navigation accidentelle
  // checkout.resetCheckout();
});
</script>

<template>
  <section class="flex flex-col gap-6 w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h1 class="font-encode text-4xl font-extrabold text-black">Finaliser votre abonnement</h1>
      <p class="font-outfit text-lg text-black-transparent">
        Choisissez votre plan et finalisez votre abonnement en quelques étapes simples.
      </p>
    </div>

    <!-- Stepper -->
    <CheckoutStepper
      :steps="checkout.stepsWithStatus.value"
      :current-step-index="checkout.state.currentStepIndex"
      :progress-percentage="checkout.progressPercentage.value"
      @go-to-step="handleStepNavigation"
    />

    <!-- Error message -->
    <div
      v-if="checkout.state.error"
      class="bg-error/10 border border-error text-error rounded-lg p-4"
    >
      <p class="font-outfit font-medium">{{ checkout.state.error }}</p>
    </div>

    <!-- Main content area -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
      <!-- Loading state -->
      <div v-if="checkout.state.isLoading" class="flex items-center justify-center h-96">
        <div class="flex items-center gap-3">
          <svg
            class="animate-spin h-6 w-6 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span class="font-outfit text-gray-600">Chargement...</span>
        </div>
      </div>

      <!-- Step content -->
      <div v-else class="p-6">
        <!-- Plan Selection Step -->
        <PlanSelectionStep v-if="checkout.currentStep.value.id === 'plan-selection'" />

        <!-- Billing Address Step -->
        <BillingAddressStep v-else-if="checkout.currentStep.value.id === 'billing-address'" />

        <!-- Payment Method Step -->
        <PaymentMethodStep v-else-if="checkout.currentStep.value.id === 'payment-method'" />

        <!-- Order Summary Step -->
        <component
          v-else-if="checkout.currentStep.value.id === 'order-summary'"
          :is="OrderSummaryStep"
        />
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="flex items-center justify-between">
      <!-- Left side buttons -->
      <div class="flex items-center gap-3">
        <button
          @click="handleCancel"
          class="font-outfit font-medium text-gray-600 hover:text-black px-4 py-2 transition-colors duration-150"
        >
          Annuler
        </button>
      </div>

      <!-- Right side buttons -->
      <div class="flex items-center gap-3">
        <button
          v-if="!checkout.isFirstStep.value"
          @click="handlePrevious"
          :disabled="!checkout.canGoPrevious.value"
          class="font-outfit font-medium text-gray-600 hover:text-black px-6 py-2 border border-gray-300 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>

        <button
          v-if="!checkout.isLastStep.value"
          @click="handleNext"
          :disabled="!checkout.canGoNext.value"
          class="bg-primary hover:bg-primary/90 text-black font-outfit font-medium px-6 py-2 rounded-lg border-2 border-black shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[4px] active:shadow-[0_0px_0_#000] transition-all duration-75 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_#000]"
        >
          Suivant
        </button>

        <button
          v-else
          @click="handleNext"
          :disabled="!checkout.canGoNext.value"
          class="bg-green-500 hover:bg-green-600 text-white font-outfit font-medium px-6 py-2 rounded-lg border-2 border-black shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[4px] active:shadow-[0_0px_0_#000] transition-all duration-75 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_#000]"
        >
          Finaliser l'achat
        </button>
      </div>
    </div>
  </section>
</template>
