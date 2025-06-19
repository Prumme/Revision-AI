<script setup lang="ts">
import caracterRed from "@/assets/caracters/caracterRed.png";
import caracterBlue from "@/assets/caracters/caracterBlue.png";
import caracterYellow from "@/assets/caracters/caracterYellow.png";
import caracterOrange from "@/assets/caracters/caracterOrange.png";
</script>

<template>
  <section class="py-16 bg-blue-light" id="benefits">
    <div class="max-w-6xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-encode font-bold text-black text-center mb-12">
        Pourquoi choisir Revision<span class="text-primary">AI</span> ?
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <!-- Card 1 -->
        <div
          class="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <div class="mb-4 flex items-center justify-center">
            <img :src="caracterOrange" alt="Mascotte IA" class="w-16 h-16 object-contain" />
          </div>
          <h3 class="font-encode text-lg font-semibold mb-2">Quiz personnalisés</h3>
          <p class="font-outfit text-gray-700 text-sm">Adaptés à ton niveau et à tes matières.</p>
        </div>
        <!-- Card 2 -->
        <div
          class="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <div class="mb-4 flex items-center justify-center">
            <img :src="caracterYellow" alt="Mascotte IA" class="w-16 h-16 object-contain" />
          </div>
          <h3 class="font-encode text-lg font-semibold mb-2">Gain de temps</h3>
          <p class="font-outfit text-gray-700 text-sm">Fini les fiches, l’IA fait le taf.</p>
        </div>
        <!-- Card 3 -->
        <div
          class="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <div class="mb-4 flex items-center justify-center">
            <img :src="caracterBlue" alt="Mascotte IA" class="w-16 h-16 object-contain" />
          </div>
          <h3 class="font-encode text-lg font-semibold mb-2">Suivi intelligent</h3>
          <p class="font-outfit text-gray-700 text-sm">
            Visualise tes progrès et renforce tes points faibles.
          </p>
        </div>
        <!-- Card 4 -->
        <div
          class="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <div class="mb-4 flex items-center justify-center">
            <img :src="caracterRed" alt="Mascotte IA" class="w-16 h-16 object-contain" />
          </div>
          <h3 class="font-encode text-lg font-semibold mb-2">Accessible partout</h3>
          <p class="font-outfit text-gray-700 text-sm">Sur ordi, tablette ou mobile.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bg-blue-light {
  background-color: var(--color-blue-light);
}
.bg-pale-yellow {
  background-color: var(--color-pale-yellow);
}
.bg-pale-green {
  background-color: var(--color-pale-green);
}
.bg-pale-purple {
  background-color: var(--color-pale-purple);
}
.bg-pale-red {
  background-color: var(--color-pale-red);
}
.text-primary {
  color: var(--color-primary);
}
</style>
