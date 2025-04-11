<script setup lang="ts">
const { variant, title, number } = defineProps<{
  variant: "green" | "purple" | "yellow" | "red";
  title: string;
  number: string;
}>();
</script>

<template>
  <section
    class="p-8 font-encode rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
    :class="{
      'bg-pale-green/50 border-1 border-pale-green/30': variant === 'green',
      'bg-pale-purple/50 border-1 border-pale-purple/30': variant === 'purple',
      'bg-pale-yellow/50 border-1 border-pale-yellow/30': variant === 'yellow',
      'bg-pale-red/50 border-1 border-pale-red/30': variant === 'red',
    }"
  >
    <div class="flex flex-col gap-8 ">
      <h1 class="text-lg font-extrabold text-black">{{ title }}</h1>
      <p class="text-4xl font-bold text-black">{{ number }}</p>
    </div>
  </section>
</template>
