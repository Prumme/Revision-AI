<script setup lang="ts">
import FormTitle from "@/components/forms/FormTitle.vue";
import FormDescription from "@/components/forms/FormDescription.vue";

const { title, description } = defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <FormDescription>{{ description }}</FormDescription>
    <FormTitle>{{ title }}</FormTitle>
  </div>
</template>
