<script setup lang="ts">
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <section
    class="relative overflow-hidden bg-blue-light min-h-[70vh] flex items-center justify-center py-16 md:py-24"
  >
    <div
      class="relative z-10 flex flex-col md:flex-row items-center gap-10 w-full max-w-6xl mx-auto px-4"
    >
      <!-- Texte -->
      <div class="flex-1 text-center md:text-left">
        <h1 class="font-encode text-3xl md:text-5xl font-extrabold text-black mb-4 leading-tight">
          Révisez plus intelligemment avec l'<span class="text-primary">IA</span>
        </h1>
        <p class="font-outfit text-lg md:text-2xl text-gray-700 mb-8">
          Transformez vos cours en quiz personnalisés, en un seul clic.
        </p>
        <RouterLink to="/register">
          <ButtonComponent variant="primary"> Commencer gratuitement !</ButtonComponent>
        </RouterLink>
      </div>

      <!-- Mockup / Animation (placeholder) -->
      <div class="flex-1 flex items-center justify-center">
        <div
          class="w-[420px] h-[420px] bg-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-gray-200 relative overflow-hidden"
        >
          <!-- Placeholder GIF/animation -->
          <div class="flex flex-col items-center justify-center gap-4">
            <span class="text-xs text-gray-400 mt-2">[Mockup de l'app]</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bg-blue-light {
  background-color: var(--color-blue-light);
}
.text-primary {
  color: var(--color-primary);
}
.bg-pale-yellow {
  background-color: var(--color-pale-yellow);
}
</style>
