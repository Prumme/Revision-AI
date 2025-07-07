<script setup lang="ts">
import { CreditCard, Download, ChevronDown } from "lucide-vue-next";
import CardComponent from "@/components/cards/CardComponent.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { User as UserType } from "@/types/user";
import type { Invoice } from "@/types/invoice";
import { AdminService } from "@/services/admin.service";
import { useToastStore } from "@/stores/toast";
import { ref } from "vue";

const props = defineProps<{
  user: UserType;
  invoices: Invoice[];
}>();

const toast = useToastStore();
const isDropdownOpen = ref(false);

const subscriptionTiers = [
  { value: "free", label: "Gratuit" },
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
];

const getSubscriptionTier = (tier: string) => {
  switch (tier) {
    case "free":
      return "Gratuit";
    case "basic":
      return "Basic";
    case "pro":
      return "Pro";
    default:
      return "Gratuit";
  }
};

const updateSubscription = async (tier: string) => {
  try {
    await AdminService.updateUserSubscription(props.user._id, tier);
    toast.showToast("success", "L'abonnement a été mis à jour avec succès");
    emit("refresh", tier);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'abonnement:", error);
    toast.showToast("error", "Erreur lors de la mise à jour de l'abonnement");
  } finally {
    isDropdownOpen.value = false;
  }
};

const emit = defineEmits<{
  (e: "refresh", newTier?: string): void;
}>();
</script>

<template>
  <CardComponent>
    <template #header>
      <div class="flex items-center gap-2 mb-4">
        <CreditCard class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900">Informations de Facturation</h2>
      </div>
    </template>
    <template #content>
      <div
        v-if="user.subscriptionTier || user.customerId || user.firstName || user.address"
        class="space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Plan d'abonnement</label>
            <div class="flex items-center gap-2">
              <StatusBadge
                :variant="
                  getSubscriptionTier(user.subscriptionTier) !== 'Gratuit' ? 'success' : 'secondary'
                "
              >
                {{ getSubscriptionTier(user.subscriptionTier) }}
              </StatusBadge>
              <div class="relative">
                <button
                  @click="isDropdownOpen = !isDropdownOpen"
                  class="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronDown class="w-4 h-4 text-gray-500" />
                </button>
                <div
                  v-if="isDropdownOpen"
                  class="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
                >
                  <button
                    v-for="tier in subscriptionTiers"
                    :key="tier.value"
                    @click="updateSubscription(tier.value)"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {{ tier.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="user.customerId">
            <label class="block text-sm font-medium text-gray-500 mb-1">ID Client Stripe</label>
            <p class="text-gray-900 font-mono text-sm">{{ user.customerId }}</p>
          </div>
          <div v-if="user.firstName || user.lastName">
            <label class="block text-sm font-medium text-gray-500 mb-1">Nom complet</label>
            <p class="text-gray-900">
              {{ [user.firstName, user.lastName].filter(Boolean).join(" ") || "-" }}
            </p>
          </div>
          <div v-if="user.address">
            <label class="block text-sm font-medium text-gray-500 mb-1"
              >Adresse de facturation</label
            >
            <div class="text-gray-900">
              <p v-if="user.address.line1">
                {{ user.address.line1 }}
                <span v-if="user.address.line2"> - {{ user.address.line2 }}</span>
              </p>
              <p v-if="user.address.city || user.address.postal_code">
                {{ [user.address.postal_code, user.address.city].filter(Boolean).join(" ") }}
              </p>
              <p v-if="user.address.country">{{ user.address.country }}</p>
            </div>
          </div>
        </div>

        <!-- Liste des factures -->
        <div v-if="invoices.length > 0">
          <label class="block text-sm font-medium text-gray-500 mb-3"
            >Factures ({{ invoices.length }})</label
          >
          <div class="divide-y divide-gray-200 max-h-32 overflow-y-scroll">
            <div
              v-for="invoice in invoices"
              :key="invoice.id"
              class="flex items-center justify-between py-4"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    Facture #{{ invoice.number || invoice.id }}
                  </p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ (invoice.total / 100).toFixed(2) }} {{ invoice.currency.toUpperCase() }}
                  </p>
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  {{ new Date(invoice.created * 1000).toLocaleDateString("fr-FR") }}
                </p>
              </div>
              <a
                v-if="invoice.invoice_pdf"
                :href="invoice.invoice_pdf"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 hover:text-gray-700 ml-4"
              >
                <Download class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <CreditCard class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucune information de facturation disponible</p>
      </div>
    </template>
  </CardComponent>
</template>
