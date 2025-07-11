<script setup lang="ts">
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import type { CheckoutData } from "@/composables/useCheckoutFlow";

const props = defineProps<{
  selectedPlan: SubscriptionInfo | null;
  billingAddress: CheckoutData["billingAddress"];
  paymentMethod: CheckoutData["paymentMethod"];
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<(event: "confirm-order") => void>();

const handleConfirm = () => {
  emit("confirm-order");
};
</script>

<template>
  <div class="flex flex-col gap-6 relative">
    <div class="flex flex-col gap-2">
      <h2 class="font-encode text-2xl font-bold text-black">Récapitulatif de la commande</h2>
      <p class="font-outfit text-gray-600">
        Vérifiez les informations avant de finaliser votre abonnement.
      </p>
    </div>

    <div v-if="props.error" class="bg-error/10 border border-error text-error rounded-lg p-4">
      <p class="font-outfit font-medium">{{ props.error }}</p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-4">
      <div>
        <h3 class="font-outfit font-semibold text-black mb-1">Plan sélectionné</h3>
        <p class="font-outfit text-primary font-medium">
          {{ props.selectedPlan?.productName.toUpperCase() }} -
          {{ (props.selectedPlan?.amount || 0) / 100 }}€ /
          {{ props.selectedPlan?.recurringInterval === "month" ? "mois" : "an" }}
        </p>
      </div>
      <div>
        <h3 class="font-outfit font-semibold text-black mb-1">Adresse de facturation</h3>
        <p class="font-outfit text-gray-700">
          {{ props.billingAddress.firstName }} {{ props.billingAddress.lastName }}<br />
          {{ props.billingAddress.line1
          }}<span v-if="props.billingAddress.line2">, {{ props.billingAddress.line2 }}</span
          ><br />
          {{ props.billingAddress.postalCode }} {{ props.billingAddress.city }}<br />
          {{ props.billingAddress.state }}, {{ props.billingAddress.country }}
        </p>
      </div>
      <div>
        <h3 class="font-outfit font-semibold text-black mb-1">Méthode de paiement</h3>
        <p class="font-outfit text-gray-700">
          <span v-if="props.paymentMethod.paymentMethodObject">
            Carte enregistrée : **** **** ****
            {{ props.paymentMethod.paymentMethodObject.card?.last4 }}<br />
            Exp : {{ props.paymentMethod.paymentMethodObject.card?.exp_month }}/{{
              props.paymentMethod.paymentMethodObject.card?.exp_year
            }}
          </span>
          <span v-else> Méthode de paiement non renseignée. </span>
        </p>
      </div>
    </div>

    <button
      @click="handleConfirm"
      :disabled="props.isLoading"
      class="bg-green-500 hover:bg-green-600 text-white font-outfit font-medium px-6 py-2 rounded-lg border-2 border-black shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[4px] active:shadow-[0_0px_0_#000] transition-all duration-75 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_#000]"
    >
      Valider l'abonnement
    </button>
  </div>
</template>
