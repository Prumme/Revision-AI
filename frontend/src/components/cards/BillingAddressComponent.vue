<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Input from "@/components/inputs/InputComponent.vue";
import { ApiService } from "@/services/api.service";
import { useToastStore } from "@/stores/toast";

const props = defineProps({
  customer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["updated"]);

const toastStore = useToastStore();

const firstName = ref("");
const lastName = ref("");

const line1 = ref("");
const line2 = ref("");
const city = ref("");
const state = ref("");
const postalCode = ref("");
const country = ref("");

// Initialiser les champs du formulaire lorsque customer change
watch(
  () => props.customer,
  (newCustomer) => {
    if (newCustomer && newCustomer.customer) {
      firstName.value = newCustomer.customer.firstName || "";
      lastName.value = newCustomer.customer.lastName || "";
      line1.value = newCustomer.customer.address?.line1 || "";
      line2.value = newCustomer.customer.address?.line2 || "";
      city.value = newCustomer.customer.address?.city || "";
      state.value = newCustomer.customer.address?.state || "";
      postalCode.value = newCustomer.customer.address?.postal_code || "";
      country.value = newCustomer.customer.address?.country || "";
    }
  },
  { immediate: true },
);

const isFormValid = computed(() => {
  return line1.value && city.value && state.value && postalCode.value && country.value;
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toastStore.showToast("error", "Veuillez remplir tous les champs obligatoires.");
    return;
  }

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
    emit("updated"); // Émettre l'événement après une mise à jour réussie
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de la mise à jour de l'adresse de facturation";
    toastStore.showToast("error", errorMessage);
  }
};
</script>

<template>
  <section
    id="billing-form-card"
    class="flex flex-col p-5 bg-white border-1 border-gray-extralight rounded-lg h-full"
  >
    <div class="flex items-center gap-3">
      <h1 class="font-outfit text-lg text-black-transparent mb-4">
        Modifier votre adresse de facturation
      </h1>
    </div>

    <div class="flex flex-col gap-4 flex-grow">
      <Input v-model="firstName" label="Prénom" placeholder="Entrez votre prénom" required />
      <Input
        v-model="lastName"
        label="Nom de famille"
        placeholder="Entrez votre nom de famille"
        required
      />
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
      <Input v-model="city" label="Ville" placeholder="Entrez votre ville" required />
      <Input
        v-model="state"
        label="État / Province / Région"
        placeholder="Entrez votre état, province ou région"
        required
      />
      <Input
        v-model="postalCode"
        label="Code postal"
        placeholder="Entrez votre code postal"
        required
      />
      <Input v-model="country" label="Pays" placeholder="Entrez votre pays" required />
    </div>
    <div class="mt-auto pt-4">
      <button
        @click="handleSubmit"
        :disabled="!isFormValid"
        class="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirmer la modification de l'adresse de facturation
      </button>
    </div>
  </section>
</template>
