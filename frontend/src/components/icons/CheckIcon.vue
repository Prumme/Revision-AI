<script setup lang="ts">
const props = defineProps<{
  color?: string;
}>();

const colorClass = props.color ? `text-${props.color}` : "text-primary";
</script>

<template>
  <svg
    class="w-5 h-5"
    :class="colorClass"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    viewBox="0 0 24 24"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
  </svg>
</template>
