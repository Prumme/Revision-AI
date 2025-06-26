<script setup lang="ts">
import { ref } from "vue";
import ToastComponent from "@/components/toasts/ToastComponent.vue";

import AvatarComponent from "./avatar/AvatarComponent.vue";
import { useUserStore } from "@/stores/user";
import { API_URL } from "@/config/api";

const { user, token, setAvatar } = useUserStore();

const profilePicture = ref<string | null>(null);
const showSuccessToast = ref(false);
const showErrorToast = ref(false);
const errorMessage = ref("");

const updateProfilePicture = (newPicture: string) => {
  profilePicture.value = newPicture;
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`${API_URL}/users/me/avatar`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Une erreur est survenue lors du changement d'avatar");
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          updateProfilePicture(e.target.result as string);
          const data = await response.json();
          setAvatar(data.user.avatar);
          showSuccessToast.value = true;
        }
      };
      reader.readAsDataURL(file);
    } catch (error: unknown) {
      showErrorToast.value = true;
      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du changement d'avatar";
    }
  }
};
</script>

<template>
  <div class="flex flex-col items-center">
    <button @click="() => $refs.fileInput.click()">
      <img
        v-if="profilePicture"
        :src="profilePicture"
        alt="Profile Picture"
        class="w-32 lg:w-64 h-32 lg:h-64 border-5 border-primary rounded-full object-cover mb-4 drop-shadow-xl hover:backdrop-blur-sm"
      />
      <AvatarComponent v-else size="full" :user="user" />
    </button>

    <input
      type="file"
      accept="image/*"
      @change="handleFileChange"
      class="mt-4"
      hidden
      ref="fileInput"
    />

    <ToastComponent
      v-if="showSuccessToast"
      type="success"
      message="Votre photo de profil a été mise à jour avec succès"
      @close="showSuccessToast = false"
    />

    <ToastComponent
      v-if="showErrorToast"
      type="error"
      :message="errorMessage"
      @close="showErrorToast = false"
    />
  </div>
</template>
