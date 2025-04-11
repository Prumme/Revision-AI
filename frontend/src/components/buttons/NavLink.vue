<script setup lang="ts">
import DynamicIcon from "@/components/icons/DynamicIcon.vue";

const { to, icon, text, active } = defineProps<{
  to: string;
  icon: string;
  text: string;
  active: boolean;
}>();
</script>

<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-5 px-4 py-3 rounded-lg"
    :class="{ 'hover:bg-primary  duration-200': !active, 'bg-primary ': active }"
  >
    <DynamicIcon :name="icon" />
    <span>{{ text }}</span>
  </RouterLink>
</template>
