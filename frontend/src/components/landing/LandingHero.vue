<script setup lang="ts">
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";
import { Motion } from "@motionone/vue";
import image from "../../assets/images/illuLanding.png";
</script>

<template>
  <Motion
    v-motion-in-view
    :initial="{ opacity: 0, y: 40 }"
    :animate="{ opacity: 1, y: 0 }"
    transition="{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }"
  >
    <section
      class="relative overflow-hidden bg-blue-light min-h-[70vh] flex items-center justify-center py-16 md:py-24"
    >
      <div
        class="relative z-10 flex flex-col md:flex-row items-center gap-10 w-full max-w-6xl mx-auto px-4"
      >
        <!-- Texte -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, x: -40 }"
          :animate="{ opacity: 1, x: 0 }"
          transition="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }"
          class="flex-1 text-center md:text-left"
        >
          <h1 class="font-encode text-3xl md:text-5xl font-extrabold text-black mb-4 leading-tight">
            Révisez plus intelligemment grâce à l'<span class="text-primary">IA</span>
          </h1>
          <p class="font-outfit text-lg md:text-2xl text-gray-700 mb-8">
            Transformez vos cours en quiz personnalisés, en un seul clic.
          </p>
          <RouterLink to="/register">
            <Motion
              v-motion-in-view
              :initial="{ opacity: 0, scale: 0.9 }"
              :animate="{ opacity: 1, scale: 1 }"
              transition="{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }"
            >
              <ButtonComponent variant="primary" tracking_event="landing_start_free_trial_cta">
                Commencer gratuitement !</ButtonComponent
              >
            </Motion>
          </RouterLink>
        </Motion>
        <!-- Mockup / Animation (placeholder) -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, x: 40 }"
          :animate="{ opacity: 1, x: 0 }"
          transition="{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }"
          class="flex-1 flex items-center justify-center"
        >
          <img :src="image" />
        </Motion>
      </div>
    </section>
  </Motion>
</template>
