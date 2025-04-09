<template>
  <label :for="forId" class="font-outfit text-xs font-light uppercase text-gray cursor-pointer">
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps({
  forId: { type: String, required: true },
});
</script>
