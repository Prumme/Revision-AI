<script setup lang="ts">
import { ref, computed } from "vue";
import { useCheckoutFlow } from "@/composables/useCheckoutFlow";
import StripePaymentMethodInput from "@/components/inputs/StripePaymentMethodInput.vue";
import type { PaymentMethod } from "@stripe/stripe-js";
import type { CheckoutData } from "@/composables/useCheckoutFlow";

const emit = defineEmits<
  (event: "update-payment-method", paymentInfo: Partial<CheckoutData["paymentMethod"]>) => void
>();

// Ref pour StripePaymentMethodInput
const stripeInputRef = ref<{ createPaymentMethod: () => Promise<{ paymentMethod?: PaymentMethod; error?: string }> } | null>(null);
const paymentMethodCreated = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

// Computed pour les informations du plan sélectionné
const checkout = useCheckoutFlow();
const selectedPlan = computed(() => checkout.state.data.selectedPlan);
const planPrice = computed(() => {
  if (!selectedPlan.value) return "0.00";
  return (selectedPlan.value.amount / 100).toFixed(2);
});
const planName = computed(() => selectedPlan.value?.productName.toUpperCase() || "");

// Validation Stripe (pour activer le bouton Suivant)
const isValid = ref(false);
const isComplete = ref(false);

const handleValidationChange = (valid: boolean, complete: boolean) => {
  isValid.value = valid;
  isComplete.value = complete;
  emit("update-payment-method", {
    isValid: valid,
    isComplete: complete,
  });
};

// Gestionnaire pour la création de la méthode de paiement
const handlePaymentMethodCreated = (paymentMethod: PaymentMethod) => {
  paymentMethodCreated.value = true;
  emit("update-payment-method", {
    isValid: true,
    isComplete: true,
    paymentMethodId: paymentMethod.id,
    paymentMethodObject: paymentMethod,
  });
};

// Nouvelle méthode à appeler par le parent (CheckoutView) pour valider la carte et avancer
const validateAndCreatePaymentMethod = async () => {
  errorMessage.value = "";
  if (!stripeInputRef.value) return false;
  isLoading.value = true;
  const result = await stripeInputRef.value.createPaymentMethod();
  isLoading.value = false;
  if (result && result.paymentMethod) {
    handlePaymentMethodCreated(result.paymentMethod);
    return true;
  } else if (result && result.error) {
    errorMessage.value = result.error;
    return false;
  }
  return false;
};

defineExpose({ validateAndCreatePaymentMethod });
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h2 class="font-encode text-2xl font-bold text-black">Méthode de paiement</h2>
      <p class="font-outfit text-gray-600">
        Saisissez vos informations de carte bancaire pour finaliser votre abonnement.
      </p>
    </div>

    <!-- Plan summary -->
    <div v-if="selectedPlan" class="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-2">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-outfit font-semibold text-black text-sm">
            Récapitulatif de votre commande
          </h3>
          <p class="font-outfit text-primary font-medium">
            Plan {{ planName }} - {{ planPrice }}€ /{{
              selectedPlan.recurringInterval === "month" ? "mois" : "an"
            }}
          </p>
        </div>
        <div class="text-right">
          <p class="font-outfit text-2xl font-bold text-black">{{ planPrice }}€</p>
          <p class="font-outfit text-sm text-gray-600">
            {{ selectedPlan.recurringInterval === "month" ? "par mois" : "par an" }}
          </p>
        </div>
      </div>
    </div>

    <!-- Payment Method Input -->
    <StripePaymentMethodInput
      ref="stripeInputRef"
      @validation-change="handleValidationChange"
      @payment-method-created="handlePaymentMethodCreated"
    />

    <!-- Success message -->
    <div v-if="paymentMethodCreated" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
            <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
          </svg>
        </div>
        <span class="font-outfit text-green-700 font-medium">
          ✅ Méthode de paiement configurée avec succès
        </span>
      </div>
      <p class="font-outfit text-sm text-green-600 mt-1 ml-6">
        Vous pouvez maintenant passer à l'étape suivante pour finaliser votre abonnement.
      </p>
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="bg-error/10 border border-error text-error rounded-lg p-4">
      <p class="font-outfit font-medium">{{ errorMessage }}</p>
    </div>
  </div>
</template>
