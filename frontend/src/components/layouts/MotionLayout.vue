<template>
  <Motion
    :initial="{ opacity: 0, y: 40 }"
    :animate="{ opacity: 1, y: 0 }"
    transition="{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }"
  >
    <slot />
  </Motion>
</template>

<script setup lang="ts">
import { Motion } from '@motionone/vue';
</script>
