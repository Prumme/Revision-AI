<script setup lang="ts">
import CardComponent from "@/components/cards/CardComponent.vue";
</script>

<template>
  <CardComponent id="form-card">
    <template #header>
      <h1 class="font-outfit text-lg text-black-transparent mb-4">
        <slot name="title"></slot>
      </h1>
    </template>
    <template #content>
      <p class="font-outfit text-lg text-black-transparent">
        <slot name="description"></slot>
      </p>
      <slot name="content"> </slot>
    </template>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </CardComponent>
</template>
