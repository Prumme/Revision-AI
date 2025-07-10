<script setup lang="ts">
import { ref } from "vue";
import InputComponent from "@/components/inputs/InputComponent.vue";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { useUserStore } from "@/stores/user";
import { useToastStore } from "@/stores/toast";
import { ApiService } from "@/services/api.service";

const props = defineProps<{
  quizId?: string;
  quizName?: string;
  userId?: string;
  userName?: string;
}>();

const emit = defineEmits(["close"]);
const userStore = useUserStore();
const toastStore = useToastStore();

const reason = ref("");
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!reason.value.trim()) {
    toastStore.showToast("error", "Veuillez entrer une raison pour le signalement");
    return;
  }

  try {
    isSubmitting.value = true;
    await ApiService.post("/reports", {
      type: props.quizId ? "quiz" : "user",
      targetId: props.quizId || props.userId,
      targetName: props.quizName || props.userName,
      reporter_id: userStore.user?.id,
      reporter_name: userStore.user?.username,
      reason: reason.value,
    });

    toastStore.showToast("success", "Le signalement a été envoyé avec succès");
    emit("close");
  } catch {
    toastStore.showToast("error", "Une erreur est survenue lors de l'envoi du signalement");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-bold text-black">Signaler</h2>
      <p class="text-gray-600">
        {{ props.quizId ? "Signaler ce quiz" : "Signaler cet utilisateur" }}
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <div v-if="props.quizId" class="text-sm text-gray-600">
        Quiz : <span class="font-medium">{{ props.quizName }}</span>
      </div>
      <div v-if="props.userId" class="text-sm text-gray-600">
        Utilisateur : <span class="font-medium">{{ props.userName }}</span>
      </div>

      <InputComponent
        v-model="reason"
        label="Raison du signalement"
        placeholder="Décrivez la raison du signalement"
        type="textarea"
        :show-criteria="false"
      />
    </div>

    <div class="flex justify-end gap-4">
      <ButtonComponent variant="outline" @click="emit('close')"> Annuler </ButtonComponent>
      <ButtonComponent variant="primary" @click="handleSubmit" :disabled="isSubmitting">
        {{ isSubmitting ? "Envoi en cours..." : "Envoyer le signalement" }}
      </ButtonComponent>
    </div>
  </div>
</template>
