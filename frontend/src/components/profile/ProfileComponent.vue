<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ArrowRightFromLineIcon } from "lucide-vue-next";
import AvatarComponent from "./avatar/AvatarComponent.vue";

const { isSidebarOpen } = defineProps<{
  isSidebarOpen: boolean;
  icon?: boolean;
}>();

const { getFullName, user } = useUserStore();
</script>

<template>
  <div class="flex justify-between items-center gap-4 w-full">
    <AvatarComponent :user="user" class="transition-all" />

    <div
      class="flex justify-between items-center text-black grow"
      :class="{
        block: isSidebarOpen || !icon,
        hidden: !isSidebarOpen && icon,
      }"
    >
      <div class="flex flex-col">
        <p class="font-medium">{{ getFullName() }}</p>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
      </div>
      <ArrowRightFromLineIcon v-if="icon" class="h-4 w-4 text-gray-extralight" />
    </div>
  </div>
</template>
