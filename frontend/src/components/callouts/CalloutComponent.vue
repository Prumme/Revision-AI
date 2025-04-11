<script setup lang="ts">
import { defineProps, type Component } from "vue";

const props = defineProps<{
  message: string;
  variant?: "info" | "default" | "warning" | "error";
  icon?: Component | null;
}>();
</script>

<template>
  <div
    class="font-outfit"
    :class="{
      'flex items-center gap-2 p-3 text-sm bg-blue-light border border-blue text-blue rounded-md':
        props.variant === 'info',
      'flex items-center gap-2 p-3 text-sm bg-white border border-gray-extralight text-gray-light rounded-md':
        props.variant === 'default',
      'flex items-center gap-2 p-3 text-sm bg-primary/10 border border-primary text-primary rounded-md':
        props.variant === 'warning',
      'flex items-center gap-2 p-3 text-sm bg-error/10 border border-error text-error rounded-md':
        props.variant === 'error',
    }"
  >
    <component v-if="props.icon" :is="props.icon" class="w-5 h-5 flex-shrink-0" />
    <span>{{ props.message }}</span>
  </div>
</template>
