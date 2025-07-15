<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import LandingHeader from "@/components/landing/LandingHeader.vue";
import LandingHero from "@/components/landing/LandingHero.vue";
import LandingSteps from "@/components/landing/LandingSteps.vue";
import LandingBenefits from "@/components/landing/LandingBenefits.vue";
import LandingPricing from "@/components/landing/LandingPricing.vue";
import LandingPartners from "@/components/landing/LandingPartners.vue";
import LandingTestimonials from "@/components/landing/LandingTestimonials.vue";
import LandingFAQ from "@/components/landing/LandingFAQ.vue";
import LandingCTA from "@/components/landing/LandingCTA.vue";
import LandingFooter from "@/components/landing/LandingFooter.vue";

const route = useRoute();

// Fonction pour faire un scroll smooth vers un élément
function smoothScrollTo(element: HTMLElement, duration = 1000) {
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t: number, b: number, c: number, d: number) {
    // easeInOutQuad
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

// Gérer le scroll automatique vers l'ancre
onMounted(() => {
  nextTick(() => {
    if (route.hash) {
      const targetId = route.hash.substring(1); // Enlever le #
      const element = document.getElementById(targetId);
      if (element) {
        // Délai pour s'assurer que la page est complètement chargée
        setTimeout(() => {
          smoothScrollTo(element, 1000);
        }, 100);
      }
    }
  });
});
</script>

<template>
  <LandingHeader />
  <LandingHero />
  <LandingSteps />
  <LandingBenefits />
  <LandingPricing />
  <LandingPartners />
  <LandingTestimonials />
  <LandingFAQ />
  <LandingCTA />
  <LandingFooter />
</template>
