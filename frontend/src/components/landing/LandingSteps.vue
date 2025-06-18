<script setup lang="ts"></script>

<template>
  <section id="fonctionnalites" class="py-16 bg-white">
    <div class="max-w-5xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-encode font-bold text-black text-center mb-12">
        Comment ça marche&nbsp;?
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- Étape 1 -->
        <div class="flex flex-col items-center text-center px-4">
          <div class="w-20 h-20 mb-5 flex items-center justify-center rounded-xl shadow">
            <!-- Icône upload -->
            <svg
              class="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
              />
            </svg>
          </div>
          <h3 class="font-encode text-xl font-semibold mb-2">Importez vos cours</h3>
          <p class="font-outfit text-gray-700">
            Glissez un PDF ou une image depuis votre ordi ou smartphone.
          </p>
        </div>
        <!-- Étape 2 -->
        <div class="flex flex-col items-center text-center px-4">
          <div class="w-20 h-20 mb-5 flex items-center justify-center rounded-xl shadow">
            <!-- Icône IA -->
            <svg
              class="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.73 0l-1.41-1.41M6.34 6.34L4.93 4.93"
              />
            </svg>
          </div>
          <h3 class="font-encode text-xl font-semibold mb-2">L’IA s’occupe du reste</h3>
          <p class="font-outfit text-gray-700">
            Elle comprend la matière et génère un quiz sur-mesure (QCM).
          </p>
        </div>
        <!-- Étape 3 -->
        <div class="flex flex-col items-center text-center px-4">
          <div class="w-20 h-20 mb-5 flex items-center justify-center rounded-xl shadow">
            <!-- Icône progression -->
            <svg
              class="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M8 12l4 4 4-4M12 16V4"
              />
            </svg>
          </div>
          <h3 class="font-encode text-xl font-semibold mb-2">Révisez et progressez</h3>
          <p class="font-outfit text-gray-700">
            Suivez vos scores et révisez au bon moment avec nos rappels malins.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-primary {
  color: var(--color-primary);
}
</style>
