<script setup lang="ts">
import { onUnmounted, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCheckoutFlow } from "@/composables/useCheckoutFlow";
import CheckoutStepper from "@/components/checkout/CheckoutStepper.vue";
import PlanSelectionStep from "@/components/checkout/PlanSelectionStep.vue";
import BillingAddressStep from "@/components/checkout/BillingAddressStep.vue";
import PaymentMethodStep from "@/components/checkout/PaymentMethodStep.vue";
import OrderSummaryStep from "@/components/checkout/OrderSummaryStep.vue";
import { useUserStore } from "@/stores/user";
import { subscribe } from "@/services/subscription.service";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import type { CheckoutData } from "@/composables/useCheckoutFlow";
import type { SubscribePayload } from "@/types/subscribe";

const router = useRouter();
const checkout = useCheckoutFlow();
const userStore = useUserStore();

const isOrderLoading = ref(false);
const orderError = ref<string | null>(null);

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

const handlePlanSelected = (plan: SubscriptionInfo | null) => {
  checkout.updateSelectedPlan(plan);
};

const handleBillingAddressUpdate = (address: Partial<CheckoutData["billingAddress"]>) => {
  checkout.updateBillingAddress(address);
};

const handleOrderConfirm = async () => {
  isOrderLoading.value = true;
  orderError.value = null;
  try {
    await userStore.fetchCurrentUser();
    const customerId = userStore.user?.customerId;
    const paymentMethodId = checkout.state.data.paymentMethod.paymentMethodId || "";
    const tier = checkout.state.data.selectedPlan?.productName || "";
    
    if (!customerId || !paymentMethodId || !tier) {
      throw new Error("Informations de souscription incomplètes.");
    }
    const payload: SubscribePayload = {
      customerId,
      paymentMethodId,
      tier,
    };
    await subscribe(payload);
    router.push("/subscription");
  } catch (e) {
    orderError.value =
      e instanceof Error ? e.message : "Erreur lors de la validation de l'abonnement.";
  } finally {
    isOrderLoading.value = false;
  }
};

// Chargement automatique des infos de facturation utilisateur
onMounted(async () => {
  try {
    checkout.setLoading(true);
    const customerInfo = await userStore.fetchCustomerInfo();
    if (customerInfo && customerInfo.customer) {
      checkout.updateBillingAddress({
        firstName: customerInfo.customer.firstName || "",
        lastName: customerInfo.customer.lastName || "",
        line1: customerInfo.customer.address?.line1 || "",
        line2: customerInfo.customer.address?.line2 || "",
        city: customerInfo.customer.address?.city || "",
        state: customerInfo.customer.address?.state || "",
        postalCode: customerInfo.customer.address?.postal_code || "",
        country: customerInfo.customer.address?.country || "",
      });
    }
  } catch (error) {
    checkout.setError("Erreur lors du chargement de vos informations de facturation");
    console.error("Erreur lors de la récupération des informations client:", error);
  } finally {
    checkout.setLoading(false);
  }
});

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
        <PlanSelectionStep
          v-if="checkout.currentStep.value.id === 'plan-selection'"
          @select-plan="handlePlanSelected"
          :selected-plan="checkout.state.data.selectedPlan"
        />

        <!-- Billing Address Step -->
        <BillingAddressStep
          v-else-if="checkout.currentStep.value.id === 'billing-address'"
          :billing-address="checkout.state.data.billingAddress"
          @update-billing-address="handleBillingAddressUpdate"
        />

        <!-- Payment Method Step -->
        <PaymentMethodStep
          v-else-if="checkout.currentStep.value.id === 'payment-method'"
          :payment-method="checkout.state.data.paymentMethod"
          @update-payment-method="checkout.updatePaymentMethod"
        />

        <!-- Order Summary Step -->
        <OrderSummaryStep
          v-else-if="checkout.currentStep.value.id === 'order-summary'"
          :selected-plan="checkout.state.data.selectedPlan"
          :billing-address="checkout.state.data.billingAddress"
          :payment-method="checkout.state.data.paymentMethod"
          :is-loading="isOrderLoading"
          :error="orderError"
          @confirm-order="handleOrderConfirm"
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
      </div>
    </div>
  </section>
</template>
