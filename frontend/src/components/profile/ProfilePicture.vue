<script setup lang="ts">
import { ref } from "vue";
import ToastComponent from "@/components/toasts/ToastComponent.vue";
import { Camera } from "lucide-vue-next";

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
    <button
      @click="() => $refs.fileInput.click()"
      class="relative group cursor-pointer transition-all duration-300"
    >
      <!-- Image de profil ou Avatar -->
      <img
        v-if="profilePicture"
        :src="profilePicture"
        alt="Profile Picture"
        class="w-32 lg:w-64 h-32 lg:h-64 border-5 border-primary rounded-full object-cover drop-shadow-xl transition-all duration-300 group-hover:brightness-75"
      />
      <div v-else class="transition-all duration-300 group-hover:brightness-75">
        <AvatarComponent size="full" :user="user" />
      </div>

      <!-- Overlay de hover -->
      <div class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <div class="text-white text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <Camera class="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2" />
          <span class="text-sm lg:text-base font-semibold">Changer la photo</span>
        </div>
      </div>

      <!-- Cercle d'indication -->
      <div class="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 lg:p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
        <Camera class="w-4 h-4 lg:w-5 lg:h-5" />
      </div>
    </button>

    <input
      type="file"
      accept="image/*"
      @change="handleFileChange"
      class="mt-4"
      hidden
      ref="fileInput"
    />

    <!-- Texte d'indication -->
    <p class="text-sm text-gray-600 mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
      Cliquez pour changer votre photo
    </p>

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
