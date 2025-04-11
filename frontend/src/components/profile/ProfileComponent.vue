<script setup lang="ts">
import { ArrowRightFromLineIcon } from "lucide-vue-next";
// @TODO : Implement user context inside this component
// import { useUserContext } from "@/context/UserContext";

const { isSidebarOpen } = defineProps<{
  isSidebarOpen: boolean;
  icon?: boolean;
}>();

// const { user } = useUserContext();
</script>

<template>
  <div class="flex justify-between items-center gap-4 w-full">
    <img
      src="../../assets/backgrounds/profile_picture.jpg"
      alt="Profile Picture"
      class="w-10 h-10 border border-gray-extralight rounded-xl object-cover"
    />
    <div
      class="flex justify-between items-center text-black w-full"
      :class="isSidebarOpen ? 'block' : 'hidden'"
    >
      <div class="flex flex-col">
        <p class="font-medium">John Doe</p>
        <p class="text-sm text-gray-500">johndoe@example.com</p>
      </div>
      <ArrowRightFromLineIcon v-if="icon" class="h-4 w-4 text-gray-extralight" />
    </div>
  </div>
</template>
