<script setup lang="ts">
import { UploadIcon, SunIcon, DownloadIcon } from "lucide-vue-next";
</script>

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
            <UploadIcon class="w-10 h-10 text-primary" />
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
            <SunIcon class="w-10 h-10 text-primary" />
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
            <DownloadIcon class="w-10 h-10 text-primary" />
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
