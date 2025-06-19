<script setup lang="ts">
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <section class="py-16 bg-blue-light" id="cta-final">
    <div class="max-w-2xl mx-auto px-4 flex flex-col items-center text-center">
      <h2 class="text-3xl md:text-4xl font-encode font-bold text-black mb-4">
        Prêt à booster ta mémoire&nbsp;?
      </h2>
      <p class="font-outfit text-lg text-gray-700 mb-8">
        Commence dès aujourd’hui gratuitement et découvre une nouvelle façon de réviser.
      </p>
      <RouterLink to="/register">
        <ButtonComponent variant="primary"> Essayez gratuitement !</ButtonComponent>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.bg-blue-light {
  background-color: var(--color-blue-light);
}
.font-encode {
  font-family: var(--font-encode);
}
.font-outfit {
  font-family: var(--font-outfit);
}
</style>
