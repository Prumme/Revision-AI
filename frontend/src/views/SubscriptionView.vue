<script setup lang="ts">
import BillingAddressComponent from "@/components/cards/BillingAddressComponent.vue";
import BillingPlanCard from "@/components/cards/BillingPlanCard.vue";
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import MotionLayout from "@/components/layouts/MotionLayout.vue";

const userStore = useUserStore();
const activeTab = ref("apercu");
const customer = ref(null);

const user = userStore.user;

const fetchCustomerInfo = async () => {
  customer.value = await userStore.fetchCustomerInfo();
};

onMounted(async () => {
  await fetchCustomerInfo();
});

const tabs = [
  { key: "apercu", label: "Aperçu" },
  { key: "adresse", label: "Adresse de facturation" },
];
</script>

<template>
  <MotionLayout>
    <section class="flex flex-col gap-1.5 w-full">
      <p class="font-outfit text-lg text-black-transparent">
        Gérez votre abonnement et vos informations de paiement.
      </p>
      <h1 class="font-outfit text-4xl font-extrabold text-black mb-6">Abonnement</h1>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="font-outfit px-4 py-2 -mb-px text-lg transition-colors duration-150"
          :class="[
          activeTab === tab.key
            ? 'border-b-2 border-primary text-black font-semibold'
            : 'text-black-transparent hover:text-black',
        ]"
          style="background: none"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Contents -->
      <div v-if="activeTab === 'apercu'">
        <!-- Contenu Aperçu -->
        <BillingPlanCard :user="user" />
      </div>
      <div v-else-if="activeTab === 'adresse'">
        <!-- Contenu Adresse de facturation -->
        <BillingAddressComponent :customer="customer" @updated="fetchCustomerInfo" />
      </div>
    </section>
  </MotionLayout>
</template>
