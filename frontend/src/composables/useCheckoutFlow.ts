import { computed, reactive, readonly } from "vue";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import type { PaymentMethod } from "@stripe/stripe-js";

// Types pour le checkout
export interface CheckoutStep {
  id: string;
  label: string;
  isCompleted: boolean;
  isValid: boolean;
}

export interface CheckoutData {
  selectedPlan: SubscriptionInfo | null;
  billingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: {
    isValid: boolean;
    isComplete: boolean;
    paymentMethodId?: string;
    paymentMethodObject?: PaymentMethod; // Objet Stripe PaymentMethod complet
  };
}

export interface CheckoutState {
  currentStepIndex: number;
  isLoading: boolean;
  error: string | null;
  data: CheckoutData;
}

export const useCheckoutFlow = () => {
  // État du checkout
  const state = reactive<CheckoutState>({
    currentStepIndex: 0,
    isLoading: false,
    error: null,
    data: {
      selectedPlan: null,
      billingAddress: {
        firstName: "",
        lastName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      paymentMethod: {
        isValid: false,
        isComplete: false,
      },
    },
  });

  // Définition des étapes
  const steps: CheckoutStep[] = [
    {
      id: "plan-selection",
      label: "Choix du plan",
      isCompleted: false,
      isValid: false,
    },
    {
      id: "billing-address",
      label: "Adresse de facturation",
      isCompleted: false,
      isValid: false,
    },
    {
      id: "payment-method",
      label: "Méthode de paiement",
      isCompleted: false,
      isValid: false,
    },
    {
      id: "order-summary",
      label: "Récapitulatif",
      isCompleted: false,
      isValid: false,
    },
  ];

  // Computed properties
  const currentStep = computed(() => steps[state.currentStepIndex]);
  const isFirstStep = computed(() => state.currentStepIndex === 0);
  const isLastStep = computed(() => state.currentStepIndex === steps.length - 1);
  const canGoNext = computed(() => validateCurrentStep());
  const canGoPrevious = computed(() => state.currentStepIndex > 0);

  // Validation des étapes
  const validateCurrentStep = (): boolean => {
    switch (currentStep.value.id) {
      case "plan-selection":
        return state.data.selectedPlan !== null;

      case "billing-address":
        const addr = state.data.billingAddress;
        return !!(
          addr.firstName &&
          addr.lastName &&
          addr.line1 &&
          addr.city &&
          addr.state &&
          addr.postalCode &&
          addr.country
        );

      case "payment-method":
        return state.data.paymentMethod.isValid && state.data.paymentMethod.isComplete;

      case "order-summary":
        return (
          validateStep("plan-selection") &&
          validateStep("billing-address") &&
          validateStep("payment-method")
        );

      default:
        return false;
    }
  };

  const validateStep = (stepId: string): boolean => {
    switch (stepId) {
      case "plan-selection":
        return state.data.selectedPlan !== null;

      case "billing-address":
        const addr = state.data.billingAddress;
        return !!(
          addr.firstName &&
          addr.lastName &&
          addr.line1 &&
          addr.city &&
          addr.state &&
          addr.postalCode &&
          addr.country
        );

      case "payment-method":
        return state.data.paymentMethod.isValid && state.data.paymentMethod.isComplete;

      default:
        return false;
    }
  };

  // Actions de navigation
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      // Marquer l'étape actuelle comme complétée si elle est valide
      if (validateCurrentStep()) {
        steps[state.currentStepIndex].isCompleted = true;
        steps[state.currentStepIndex].isValid = true;
      }

      state.currentStepIndex = stepIndex;
      state.error = null;
    }
  };

  const goToNextStep = () => {
    if (canGoNext.value && !isLastStep.value) {
      goToStep(state.currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (canGoPrevious.value) {
      goToStep(state.currentStepIndex - 1);
    }
  };

  // Actions pour mettre à jour les données
  const updateSelectedPlan = (plan: SubscriptionInfo | null) => {
    state.data.selectedPlan = plan;
    state.error = null;
  };

  const updateBillingAddress = (address: Partial<CheckoutData["billingAddress"]>) => {
    Object.assign(state.data.billingAddress, address);
    state.error = null;
  };

  const updatePaymentMethod = (paymentInfo: Partial<CheckoutData["paymentMethod"]>) => {
    Object.assign(state.data.paymentMethod, paymentInfo);
    state.error = null;
  };

  // Actions pour gérer l'état global
  const setLoading = (loading: boolean) => {
    state.isLoading = loading;
  };

  const setError = (error: string | null) => {
    state.error = error;
  };

  const resetCheckout = () => {
    state.currentStepIndex = 0;
    state.isLoading = false;
    state.error = null;
    state.data = {
      selectedPlan: null,
      billingAddress: {
        firstName: "",
        lastName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      paymentMethod: {
        isValid: false,
        isComplete: false,
      },
    };

    // Reset steps
    steps.forEach((step) => {
      step.isCompleted = false;
      step.isValid = false;
    });
  };

  // Computed pour l'affichage
  const progressPercentage = computed(() => {
    const completedSteps = steps.filter((step) => step.isCompleted).length;
    return Math.round((completedSteps / steps.length) * 100);
  });

  const stepsWithStatus = computed(() => {
    return steps.map((step, index) => ({
      ...step,
      isCurrent: index === state.currentStepIndex,
      isAccessible: index <= state.currentStepIndex || step.isCompleted,
    }));
  });

  return {
    // État
    state: readonly(state),
    steps: readonly(steps),
    currentStep,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    progressPercentage,
    stepsWithStatus,

    // Actions de navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,

    // Actions de mise à jour des données
    updateSelectedPlan,
    updateBillingAddress,
    updatePaymentMethod,

    // Actions d'état global
    setLoading,
    setError,
    resetCheckout,

    // Validation
    validateCurrentStep,
    validateStep,
  };
};
