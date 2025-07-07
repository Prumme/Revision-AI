<script setup lang="ts">
import FormCard from "@/components/forms/cards/FormCard.vue";
import { useDialogStore } from "@/stores/dialog";
import { ApiService } from "@/services/api.service";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const dialogStore = useDialogStore();
const { showToast } = useToastStore();
const router = useRouter();
const userStore = useUserStore();

const handleDeleteAccount = async () => {
  const confirmed = await dialogStore.show({
    title: "Suppression du compte",
    message:
      "Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement supprimées.",
    type: "error",
    confirmText: "Oui, supprimer mon compte",
    cancelText: "Non, annuler",
  });

  if (confirmed) {
    try {
      await ApiService.delete("/users/me", true);
      showToast({
        type: "success",
        message: "Votre compte a été supprimé avec succès",
      });

      userStore.logout();

      router.push("/register");
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        message: "Une erreur est survenue lors de la suppression de votre compte",
      });
    }
  }
};
</script>

<template>
  <FormCard>
    <template #title>Supprimer mon compte</template>

    <template #content>
      <div class="flex flex-col gap-4">
        <p class="text-gray-600">
          Une fois que vous supprimez votre compte, il n'y a pas de retour en arrière possible.
          Soyez certain de votre choix.
        </p>
        <button
          @click="handleDeleteAccount"
          class="w-fit bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
        >
          Supprimer mon compte
        </button>
      </div>
    </template>
  </FormCard>
</template>
