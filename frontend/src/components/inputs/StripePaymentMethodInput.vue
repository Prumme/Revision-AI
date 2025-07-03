<script setup lang="ts">
import { ref, onMounted, defineExpose } from "vue";
import {
  loadStripe,
  type Stripe,
  type StripeCardElement,
  type PaymentMethod,
} from "@stripe/stripe-js";
import { XCircleIcon, ShieldCheckIcon } from "lucide-vue-next";

// Props et emits
const emit = defineEmits<{
  paymentMethodCreated: [paymentMethod: PaymentMethod];
  validationChange: [isValid: boolean, isComplete: boolean];
}>();

const cardElement = ref<HTMLElement | null>(null);
const errorMessage = ref("");
const isCardValid = ref(false);
const isCardComplete = ref(false);
const isCardEmpty = ref(true);
const isProcessing = ref(false);

let stripe: Stripe | null = null;
let card: StripeCardElement | null = null;

// Fonction pour récupérer les variables CSS du design system
const getCSSVariable = (variable: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// Fonction pour créer le thème Stripe basé sur les variables CSS
const createStripeTheme = () => {
  return {
    colorPrimary: getCSSVariable("--color-primary"),
    colorBackground: getCSSVariable("--color-background-alt"),
    colorText: getCSSVariable("--color-foreground"),
    colorDanger: getCSSVariable("--color-error"),
    fontFamily: getCSSVariable("--font-outfit"),
    fontSizeBase: "14px",
    borderRadius: "8px",
  };
};

// Fonction pour créer les styles de la carte
const createCardStyles = () => {
  return {
    base: {
      fontSize: "14px",
      fontFamily: getCSSVariable("--font-outfit"),
      color: getCSSVariable("--color-foreground"),
      "::placeholder": {
        color: getCSSVariable("--color-gray-light"),
      },
      iconColor: getCSSVariable("--color-primary"),
    },
    invalid: {
      color: getCSSVariable("--color-error"),
      iconColor: getCSSVariable("--color-error"),
    },
  };
};

onMounted(async () => {
  try {
    const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!stripePublicKey) {
      errorMessage.value =
        "La clé publique Stripe n'est pas définie. Vérifiez votre fichier .env et redémarrez le serveur.";
      return;
    }
    stripe = await loadStripe(stripePublicKey);

    if (!stripe) {
      errorMessage.value = "Stripe n'a pas pu être initialisé.";
      return;
    }

    const elements = stripe.elements({
      appearance: {
        theme: "stripe",
        variables: createStripeTheme(),
      },
    });

    card = elements.create("card", {
      style: createCardStyles(),
    });

    if (cardElement.value) {
      card.mount(cardElement.value);
    } else {
      return;
    }

    // Gestionnaire d'événements
    card.on("change", (event) => {
      // Mise à jour des états
      errorMessage.value = event.error?.message || "";
      isCardEmpty.value = event.empty;
      isCardComplete.value = event.complete;

      // Une carte est valide si elle n'a pas d'erreur ET n'est pas vide
      isCardValid.value = !event.error && !event.empty;

      // Émettre les changements de validation
      emit("validationChange", isCardValid.value, isCardComplete.value);
    });
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Erreur lors de l'initialisation du système de paiement.";
  }
});

// Exposer la méthode de création du paymentMethod pour le parent
const createPaymentMethod = async () => {
  if (!stripe || !card) {
    errorMessage.value = "Stripe n'est pas initialisé.";
    return { error: errorMessage.value };
  }
  if (!isCardValid.value || !isCardComplete.value) {
    errorMessage.value = "Veuillez compléter les informations de la carte.";
    return { error: errorMessage.value };
  }
  isProcessing.value = true;
  errorMessage.value = "";
  try {
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: card,
    });
    if (error) {
      errorMessage.value = error.message || "Une erreur est survenue lors du traitement du paiement";
      return { error: errorMessage.value };
    } else {
      emit("paymentMethodCreated", paymentMethod);
      return { paymentMethod };
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
    return { error: errorMessage.value };
  } finally {
    isProcessing.value = false;
  }
};
defineExpose({ createPaymentMethod });
</script>

<template>
  <div class="flex flex-col gap-6 font-outfit">
    <!-- Titre de la section -->
    <div class="flex flex-col gap-2">
      <h2 class="font-encode text-2xl font-bold text-black">Informations de paiement</h2>
      <p class="font-outfit text-sm text-gray-light">
        Veuillez saisir vos informations de carte bancaire de manière sécurisée
      </p>
    </div>

    <!-- Conteneur de la carte Stripe -->
    <div class="flex flex-col gap-4">
      <label class="font-outfit text-xs font-light uppercase text-gray-light">
        Détails de la carte
      </label>

      <div
        ref="cardElement"
        class="stripe-card-element bg-white border-2 border-gray-300 rounded-lg p-4 transition-all duration-200 focus-within:border-primary hover:border-gray-400"
        :class="{
          'border-error': errorMessage && !isCardEmpty,
          'border-green-500': isCardValid && isCardComplete && !errorMessage,
        }"
      ></div>

      <!-- Message d'erreur -->
      <div
        v-if="errorMessage"
        class="flex items-center gap-2 p-3 text-sm bg-error/10 border border-error text-error rounded-md font-outfit"
      >
        <XCircleIcon class="w-4 h-4 flex-shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Informations de sécurité -->
    <div class="flex items-center justify-center gap-2 text-xs text-gray-light font-outfit">
      <ShieldCheckIcon class="w-4 h-4" />
      <span>Paiement sécurisé par Stripe</span>
    </div>
  </div>
</template>

<style scoped>
.stripe-card-element {
  min-height: 50px;
}

/* Styles personnalisés pour l'élément Stripe */
.stripe-card-element:focus-within {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 10%, transparent);
}

/* Animation pour les erreurs */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.stripe-card-element.StripeElement--invalid {
  border-color: var(--color-error) !important;
  animation: shake 0.5s ease-in-out;
}

/* Style du placeholder et du texte dans l'élément Stripe */
.StripeElement {
  font-family: var(--font-outfit) !important;
}

/* Animation du spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
