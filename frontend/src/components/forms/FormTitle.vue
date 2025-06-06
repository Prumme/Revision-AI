<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import { PencilIcon } from "lucide-vue-next";
</script>

<template>
  <div class="flex items-center gap-5">
    <h1 class="font-outfit text-4xl font-extrabold text-black">
      <slot></slot>
    </h1>
    <Button size="icon" variant="rounded-full">
      <PencilIcon class="h-5 w-5 text-black" />
    </Button>
  </div>
</template>
