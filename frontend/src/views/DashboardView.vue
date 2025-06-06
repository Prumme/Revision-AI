<script setup lang="ts">
import { useUserStore } from "@/stores/user";

const { getFullName } = useUserStore();
</script>

<template>
  <div>
    <h1 class="font-encode text-4xl font-black">Bienvenue {{ getFullName() }}</h1>
  </div>
</template>
