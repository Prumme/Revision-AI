<script setup lang="ts">
import { ref, onMounted } from "vue";
//import { useUserStore } from "@/stores/user";

//const userStore = useUserStore();
const activeTab = ref("apercu");

onMounted(async () => {
  //const customer = await userStore.fetchCustomerInfo();
});

const tabs = [
  { key: "apercu", label: "Aperçu" },
  { key: "adresse", label: "Adresse de facturation" },
  { key: "paiement", label: "Information de paiement" },
];
</script>

<template>
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
      <div class="bg-white rounded-lg shadow p-6">
        <p class="font-outfit text-black">Contenu de l’aperçu de l’abonnement.</p>
      </div>
    </div>
    <div v-else-if="activeTab === 'adresse'">
      <!-- Contenu Adresse de facturation -->
      <div class="bg-white rounded-lg shadow p-6">
        <p class="font-outfit text-black">Adresse de facturation à afficher ici.</p>
      </div>
    </div>
    <div v-else-if="activeTab === 'paiement'">
      <!-- Contenu Information de paiement -->
      <div class="bg-white rounded-lg shadow p-6">
        <p class="font-outfit text-black">Informations de paiement à afficher ici.</p>
      </div>
    </div>
  </section>
</template>
