<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ArrowRightFromLineIcon } from "lucide-vue-next";
// @TODO : Implement user context inside this component
// import { useUserContext } from "@/context/UserContext";

const { isSidebarOpen } = defineProps<{
  isSidebarOpen: boolean;
  icon?: boolean;
}>();

const { getFullName, user } = useUserStore();
</script>

<template>
  <div class="flex justify-between items-center gap-4 w-full">
    <img
      src="../../assets/profile_picture/monkey.jpg"
      alt="Profile Picture"
      class="w-10 h-10 border border-gray-extralight rounded-xl object-cover"
    />

    <div
      class="flex justify-between items-center text-black w-full"
      :class="{
        block: isSidebarOpen || !icon,
        hidden: !isSidebarOpen && icon,
      }"
    >
      <div class="flex flex-col">
        <p class="font-medium">{{ getFullName() }}</p>
        <p class="text-sm text-gray-500">{{ user?.email || "johndoe@gmail.com" }}</p>
      </div>
      <ArrowRightFromLineIcon v-if="icon" class="h-4 w-4 text-gray-extralight" />
    </div>
  </div>
</template>
