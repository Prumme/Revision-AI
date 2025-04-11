<script setup lang="ts">
defineProps({
  forId: { type: String, required: true },
});
</script>

<template>
  <label
    :for="forId"
    class="font-outfit text-xs font-light uppercase text-gray-light cursor-pointer"
  >
    <slot />
  </label>
</template>
