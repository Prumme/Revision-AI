<script setup lang="ts">
import { ref, computed } from "vue";
import { useCheckoutFlow } from "@/composables/useCheckoutFlow";
import StripePaymentMethodInput from "@/components/inputs/StripePaymentMethodInput.vue";
import type { PaymentMethod } from "@stripe/stripe-js";

const checkout = useCheckoutFlow();

// État local pour le composant
const paymentMethodCreated = ref(false);

// Computed pour les informations du plan sélectionné
const selectedPlan = computed(() => checkout.state.data.selectedPlan);
const planPrice = computed(() => {
  if (!selectedPlan.value) return "0.00";
  return (selectedPlan.value.amount / 100).toFixed(2);
});
const planName = computed(() => selectedPlan.value?.productName.toUpperCase() || "");

// Gestionnaire pour les changements de validation
const handleValidationChange = (isValid: boolean, isComplete: boolean) => {
  checkout.updatePaymentMethod({
    isValid,
    isComplete,
  });
};

// Gestionnaire pour la création de la méthode de paiement
const handlePaymentMethodCreated = (paymentMethod: PaymentMethod) => {
  paymentMethodCreated.value = true;

  // Sauvegarder la paymentMethod complète dans l'état
  checkout.updatePaymentMethod({
    isValid: true,
    isComplete: true,
    paymentMethodId: paymentMethod.id,
    paymentMethodObject: paymentMethod,
  });

  console.log("PaymentMethod sauvegardée:", paymentMethod);
};
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

    <!-- Payment security info -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div>
          <h4 class="font-outfit font-semibold text-gray-900 text-sm mb-1">
            Paiement 100% sécurisé
          </h4>
          <p class="font-outfit text-sm text-gray-600">
            Vos informations de paiement sont traitées de manière sécurisée par Stripe. Nous ne
            stockons pas vos données de carte bancaire sur nos serveurs.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
