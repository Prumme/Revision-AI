<script setup lang="ts">
import { ref, computed } from "vue";
import Input from "@/components/inputs/InputComponent.vue";
import { ApiService } from "@/services/api.service";
import { useToastStore } from "@/stores/toast";

const toastStore = useToastStore();

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const isFormValid = computed(() => {
  return (
    oldPassword.value &&
    newPassword.value &&
    confirmPassword.value &&
    newPassword.value === confirmPassword.value
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    await ApiService.patch<User>(
      "/users/me/password",
      {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      },
      true,
    );

    // Réinitialiser les champs après succès
    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";

    // Afficher le toast de succès
    toastStore.showToast("success", "Votre mot de passe a été modifié avec succès");
  } catch (error) {
    // Afficher le toast d'erreur avec le message approprié
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de la modification du mot de passe";
    toastStore.showToast("error", errorMessage);
  }
};
</script>

<template>
  <section
    id="form-card"
    class="flex flex-col p-5 bg-white border-1 border-gray-extralight rounded-lg h-full"
  >
    <div class="flex items-center gap-3">
      <h1 class="font-outfit text-lg text-black-transparent mb-4">Modifier votre mot de passe</h1>
    </div>

    <div class="flex flex-col gap-4 flex-grow">
      <Input
        v-model="oldPassword"
        label="Ancien mot de passe"
        placeholder="********"
        type="password"
        :showCriteria="false"
        :autocomplete="off"
      />
      <Input
        v-model="newPassword"
        label="Nouveau mot de passe"
        placeholder="********"
        type="password"
        :showCriteria="true"
      />
      <Input
        v-model="confirmPassword"
        label="Confirmer le nouveau mot de passe"
        placeholder="********"
        type="password"
        :showCriteria="false"
      />
    </div>

    <div class="mt-auto pt-4">
      <button
        @click="handleSubmit"
        :disabled="!isFormValid"
        class="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirmer le changement de mot de passe
      </button>
    </div>
  </section>
</template>
