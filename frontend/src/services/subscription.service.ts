import { ApiService } from "./api.service";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";
import type { SubscribePayload } from "@/types/subscribe";

export async function fetchSubscriptionProducts() {
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
}

export async function subscribe(data: SubscribePayload) {
  try {
    const response = await ApiService.post<{ message: string }>(
      "/subscription/subscribe",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error subscribing:", error);
    throw error;
  }
}

export async function unsubscribe() {
  try {
    const response = await ApiService.post<{ message: string }>(
      "/subscription/unsubscribe",
      {},
    );
    return response.data;
  } catch (error) {
    console.error("Error unsubscribing:", error);
    throw error;
  }
}
