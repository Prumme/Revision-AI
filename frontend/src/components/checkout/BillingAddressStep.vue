<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Input from "@/components/inputs/InputComponent.vue";
import { ApiService } from "@/services/api.service";
import type { CheckoutData } from "@/composables/useCheckoutFlow";
import { useToastStore } from "@/stores/toast";
import { SaveIcon } from "lucide-vue-next";

const props = defineProps<{ billingAddress: CheckoutData["billingAddress"] }>();
const emit =
  defineEmits<
    (event: "update-billing-address", address: Partial<CheckoutData["billingAddress"]>) => void
  >();

const firstName = ref(props.billingAddress.firstName || "");
const lastName = ref(props.billingAddress.lastName || "");
const line1 = ref(props.billingAddress.line1 || "");
const line2 = ref(props.billingAddress.line2 || "");
const city = ref(props.billingAddress.city || "");
const state = ref(props.billingAddress.state || "");
const postalCode = ref(props.billingAddress.postalCode || "");
const country = ref(props.billingAddress.country || "");

const isLoading = ref(false);

const toastStore = useToastStore();

// Computed pour la validation
const isFormValid = computed(() => {
  return !!(
    firstName.value &&
    lastName.value &&
    line1.value &&
    city.value &&
    state.value &&
    postalCode.value &&
    country.value
  );
});

// Watcher pour émettre l'événement de mise à jour de l'adresse de facturation quand les champs changent
watch([firstName, lastName, line1, line2, city, state, postalCode, country], () => {
  emit("update-billing-address", {
    firstName: firstName.value,
    lastName: lastName.value,
    line1: line1.value,
    line2: line2.value,
    city: city.value,
    state: state.value,
    postalCode: postalCode.value,
    country: country.value,
  });
});

// Fonction pour sauvegarder l'adresse (optionnel - pour mettre à jour en temps réel)
const saveAddress = async () => {
  if (!isFormValid.value) return;

  try {
    await ApiService.put(
      "/subscription/customer",
      {
        firstName: firstName.value,
        lastName: lastName.value,
        address: {
          line1: line1.value,
          line2: line2.value,
          city: city.value,
          state: state.value,
          postal_code: postalCode.value,
          country: country.value,
        },
      },
      true,
    );
    toastStore.showToast("success", "Votre adresse de facturation a été mise à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'adresse:", error);
    toastStore.showToast("error", "Erreur lors de la mise à jour de l'adresse de facturation");
  }
};

onMounted(() => {
  // Aucune donnée à charger, les props sont déjà fournies par le parent
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <h2 class="font-encode text-2xl font-bold text-black">Adresse de facturation</h2>
      <p class="font-outfit text-gray-600">
        Vérifiez et modifiez vos informations de facturation si nécessaire.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="animate-pulse bg-gray-200 rounded-lg h-12"></div>
      </div>
      <div class="animate-pulse bg-gray-200 rounded-lg h-12"></div>
      <div class="animate-pulse bg-gray-200 rounded-lg h-12"></div>
    </div>

    <!-- Address form -->
    <div v-else class="space-y-4">
      <!-- Name fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input v-model="firstName" label="Prénom" placeholder="Entrez votre prénom" required />
        <Input
          v-model="lastName"
          label="Nom de famille"
          placeholder="Entrez votre nom de famille"
          required
        />
      </div>

      <!-- Address fields -->
      <Input
        v-model="line1"
        label="Adresse ligne 1"
        placeholder="Entrez l'adresse ligne 1"
        required
      />

      <Input
        v-model="line2"
        label="Adresse ligne 2 (optionnel)"
        placeholder="Entrez l'adresse ligne 2 (optionnel)"
      />

      <!-- Location fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input v-model="city" label="Ville" placeholder="Entrez votre ville" required />
        <Input
          v-model="state"
          label="État / Province / Région"
          placeholder="Entrez votre état, province ou région"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          v-model="postalCode"
          label="Code postal"
          placeholder="Entrez votre code postal"
          required
        />
        <Input v-model="country" label="Pays" placeholder="Entrez votre pays" required />
      </div>
    </div>

    <!-- Form validation status -->
    <div v-if="!isLoading" class="flex items-center gap-2 text-sm">
      <div class="w-3 h-3 rounded-full" :class="isFormValid ? 'bg-green-500' : 'bg-red-500'"></div>
      <span class="font-outfit" :class="isFormValid ? 'text-green-600' : 'text-red-600'">
        {{ isFormValid ? "Adresse complète" : "Veuillez remplir tous les champs obligatoires" }}
      </span>
    </div>

    <!-- Optional save button for real-time updates -->
    <div v-if="!isLoading && isFormValid" class="flex justify-end">
      <button
        @click="saveAddress"
        class="font-outfit text-sm text-primary hover:text-primary/80 transition-colors duration-150 flex items-center gap-2"
      >
        <SaveIcon class="h-6 w-6" />
        <span>Sauvegarder l'adresse pour plus tard</span>
      </button>
    </div>
  </div>
</template>
