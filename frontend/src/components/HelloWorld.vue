<script setup lang="ts">
import { Apple } from "lucide-vue-next";
</script>

<template>
  <RouterLink
    to="/#"
    class="flex items-center gap-5 px-4 py-3 rounded-lg hover:bg-primary hover:inset-shadow-md duration-200"
  >
    <House />
    <span>Accueil</span>
  </RouterLink>
</template>
