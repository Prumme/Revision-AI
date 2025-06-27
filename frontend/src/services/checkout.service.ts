import { ApiService } from "./api.service";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";

// Types pour le checkout
export interface CheckoutPaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface CheckoutSubscriptionRequest {
  priceId: string;
  paymentMethodId: string;
  customerId?: string;
}

// Service pour les opérations spécifiques au checkout
export const CheckoutService = {
  // Récupérer les produits d'abonnement
  async getSubscriptionProducts() {
    try {
      const response = await ApiService.get<{ products: SubscriptionInfo[] }>(
        "/subscription/subscription-products",
        false,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription products:", error);
      throw error;
    }
  },

  // Récupérer les informations client
  async getCustomerInfo() {
    try {
      const response = await ApiService.get("/subscription/customer", true);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer info:", error);
      throw error;
    }
  },

  // Mettre à jour l'adresse de facturation
  async updateBillingAddress(addressData: any) {
    try {
      const response = await ApiService.put("/subscription/customer", addressData, true);
      return response.data;
    } catch (error) {
      console.error("Error updating billing address:", error);
      throw error;
    }
  },

  // Créer un Payment Intent (à implémenter côté backend si nécessaire)
  async createPaymentIntent(amount: number, currency = "eur"): Promise<CheckoutPaymentIntent> {
    try {
      const response = await ApiService.post<CheckoutPaymentIntent>(
        "/subscription/create-payment-intent",
        { amount, currency },
        true,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  },

  // Finaliser l'abonnement
  async subscribeUser(subscriptionData: CheckoutSubscriptionRequest) {
    try {
      const response = await ApiService.post("/subscription/subscribe", subscriptionData, true);
      return response.data;
    } catch (error) {
      console.error("Error subscribing user:", error);
      throw error;
    }
  },
};
