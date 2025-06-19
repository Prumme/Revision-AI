<script setup lang="ts">
const props = defineProps<{
  direction?: "left" | "right";
  size?: number;
  color?: string;
}>();

const dir = props.direction || "right";
const size = props.size || 20;
const color = props.color || "currentColor";
</script>

<template>
  <svg
    :width="size"
    :height="size"
    fill="none"
    :stroke="color"
    stroke-width="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      :d="dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'"
    />
  </svg>
</template>
