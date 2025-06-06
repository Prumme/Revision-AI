<script setup lang="ts">
import { ref } from "vue";

const profilePicture = ref<string | null>(null);

const updateProfilePicture = (newPicture: string) => {
  profilePicture.value = newPicture;
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        updateProfilePicture(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
        class="w-64 h-64 border-5 border-primary rounded-full object-cover mb-4 drop-shadow-xl hover:backdrop-blur-sm"
      />
      <img
        v-else
        src="../../assets/profile_picture/monkey.jpg"
        alt="Profile Picture"
        class="w-64 h-64 border-5 border-primary rounded-full object-cover mb-4 drop-shadow-lg hover:grayscale-50"
      />
    </button>

    <input
      type="file"
      accept="image/*"
      @change="handleFileChange"
      class="mt-4"
      hidden
      ref="fileInput"
    />
  </div>
</template>
