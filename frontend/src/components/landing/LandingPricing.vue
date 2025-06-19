<script setup lang="ts">
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import CheckIcon from "../icons/CheckIcon.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <section id="tarifs" class="py-16 bg-white">
    <div class="max-w-6xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-encode font-bold text-black text-center mb-12">
        Des abonnements pour tous les besoins
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="relative rounded-2xl shadow p-8 flex flex-col">
          <h3 class="font-encode text-xl font-semibold mb-2">Gratuit</h3>
          <div class="font-outfit text-3xl font-bold mb-1 text-primary">0&nbsp;€ / mois</div>
          <ul class="font-outfit text-gray-700 text-sm mt-6 mb-6 space-y-4">
            <li class="flex items-center gap-2"><CheckIcon color="primary" />1 quiz / jour</li>
            <li class="flex items-center gap-2"><CheckIcon color="primary" />Fichier max 10 Mo</li>
            <li class="flex items-center gap-2">
              <CheckIcon color="primary" />Pas de rappel intelligent
            </li>
            <li class="flex items-center gap-2"><CheckIcon color="primary" />Historique limité</li>
          </ul>
          <RouterLink to="/register">
            <ButtonComponent variant="secondary"> S'inscrire </ButtonComponent>
          </RouterLink>
        </div>

        <div class="relative rounded-2xl shadow p-8 flex flex-col bg-primary">
          <h3 class="font-encode text-xl font-semibold mb-2 text-white">Basic</h3>
          <div class="font-outfit text-3xl font-bold mb-1 text-white">4,99&nbsp;€ / mois</div>
          <ul class="font-outfit text-white text-sm mt-6 mb-6 space-y-4">
            <li class="flex items-center gap-2"><CheckIcon color="white" />Quiz illimités</li>
            <li class="flex items-center gap-2">
              <CheckIcon color="white" />Taille fichier étendue (jusqu'à 50 Mo)
            </li>
            <li class="flex items-center gap-2"><CheckIcon color="white" />Rappels intelligents</li>
            <li class="flex items-center gap-2">
              <CheckIcon color="white" />Suivi de progression détaillé
            </li>
            <li class="flex items-center gap-2">
              <CheckIcon color="white" />Génération par thème / niveau
            </li>
          </ul>
          <RouterLink to="/register">
            <ButtonComponent variant="secondary-inverted"> S'inscrire </ButtonComponent>
          </RouterLink>
        </div>
        <div class="relative rounded-2xl shadow p-8 flex flex-col">
          <h3 class="font-encode text-xl font-semibold mb-2">Pro</h3>
          <div class="font-outfit text-3xl font-bold mb-1 text-primary">7,99&nbsp;€ / mois</div>
          <ul class="font-outfit text-gray-700 text-sm mt-6 mb-6 space-y-4">
            <li class="flex items-center gap-2">
              <CheckIcon color="primary" />Tout dans l'offre Basic
            </li>
            <li class="flex items-center gap-2">
              <CheckIcon color="primary" />Analyse avancée des cours
            </li>
            <li class="flex items-center gap-2">
              <CheckIcon color="primary" />Mode Révision Express
            </li>
            <li class="flex items-center gap-2">
              <CheckIcon color="primary" />Création de sessions de révision intelligentes
            </li>
            <li class="flex items-center gap-2">
              <CheckIcon color="primary" />Assistance prioritaire
            </li>
          </ul>
          <RouterLink to="/register">
            <ButtonComponent variant="secondary">S'inscrire</ButtonComponent>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bg-blue-light {
  background-color: var(--color-blue-light);
}
.bg-pale-purple {
  background-color: var(--color-pale-purple);
}
.bg-pale-yellow {
  background-color: var(--color-pale-yellow);
}
.text-primary {
  color: var(--color-primary);
}
.border-primary {
  border-color: var(--color-primary);
}
</style>
