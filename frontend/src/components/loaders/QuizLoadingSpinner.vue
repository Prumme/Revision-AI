<template>
  <div
    class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-primary shadow-lg rounded-lg px-5 py-4 min-w-[280px] max-w-xs animate-fade-in"
    :class="{ 'bg-red-100 border-red-500': quizLoadingStore.quizStatus === 'failed' }"
  >
    <svg
      v-if="quizLoadingStore.quizStatus !== 'completed'"
      class="animate-spin h-7 w-7 text-primary"
      viewBox="0 0 50 50"
    >
      <circle
        class="opacity-20"
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        stroke-width="5"
        fill="none"
      />
      <path
        class="opacity-80"
        fill="currentColor"
        d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 0 0-15-15V5z"
      />
    </svg>
    <svg
      v-else
      class="h-7 w-7 text-green-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span
      class="text-primary font-semibold text-base"
      :class="{ 'text-red-600': quizLoadingStore.quizStatus === 'failed' }"
    >
      {{ quizLoadingStore.loadingMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useQuizLoadingStore } from "@/stores/quizLoading";

const quizLoadingStore = useQuizLoadingStore();
</script>

<style scoped>
svg {
  color: #46178f;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
