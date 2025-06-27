import { ApiService } from "./api.service";
import type { SubscriptionInfo } from "@/types/subscriptionInfo";

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
