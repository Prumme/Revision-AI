<script setup lang="ts">
import FormDescription from "@/components/forms/FormDescription.vue";
import FormTitle from "@/components/forms/FormTitle.vue";

const { title, description } = defineProps<{
  title: string;
  description: string;
}>();

const emit = defineEmits(["update:title"]);

const updateTitle = (newTitle: string) => {
  emit("update:title", newTitle);
};
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <FormDescription>{{ description }}</FormDescription>
    <FormTitle @update:title="updateTitle">{{ title }}</FormTitle>
  </div>
</template>
