<script setup lang="ts">
import { computed } from "vue";
import { API_URL } from "@/config/api";

interface User {
  avatar?: string;
  username: string;
}

const props = defineProps<{
  user: User;
  size?: "sm" | "md" | "lg";
}>();

const getInitials = (username: string): string => {
  return username.charAt(0).toUpperCase();
};

const getSizeClasses = (size: string = "md") => {
  switch (size) {
    case "sm":
      return "w-8 h-8 text-sm rounded-xl";
    case "lg":
      return "w-12 h-12 text-lg rounded-xl";
    case "full":
      return "w-64 h-64 text-base rounded-full border-5 border-primary ";
    default:
      return "w-10 h-10 text-base rounded-xl";
  }
};

const avatarUrl = computed(() => {
  if (props.user.avatar) {
    return `${API_URL}/files/avatar/${props.user.avatar}`;
  }
  return null;
});
</script>

<template>
  <div
    v-if="avatarUrl"
    class="border border-gray-extralight overflow-hidden"
    :class="getSizeClasses(size)"
  >
    <img :src="avatarUrl" :alt="`Avatar de ${user.username}`" class="w-full h-full object-cover" />
  </div>
  <div
    v-else
    class="border border-gray-extralight bg-gray-100 flex items-center justify-center text-gray-600 font-medium"
    :class="getSizeClasses(size)"
  >
    {{ getInitials(user.username) }}
  </div>
</template>
