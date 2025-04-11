<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
const imgUrl = new URL("@/assets/backgrounds/background_404_view.webp", import.meta.url).href;
</script>

<template>
  <div class="h-screen w-screen relative">
    <img :src="imgUrl" alt="background_illustration" class="w-full h-full object-cover" />
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Card>
        <template #header>
          <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 class="text-2xl font-semibold mb-2">Oups, page introuvable !</h2>
        </template>

        <template #content>
          <p class="text-foreground-alt mb-6">On dirait que tu t’es un peu perdu·e…</p>
        </template>

        <template #footer>
          <router-link to="/">
            <Button>Revenir à l'accueil</Button>
          </router-link>
        </template>
      </Card>
    </div>
  </div>
</template>
