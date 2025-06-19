<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import ArrowIcon from "@/components/icons/ArrowIcon.vue";

const testimonials = [
  {
    message: "Avant, j’étais toujours à la bourre. Maintenant je révise vite et bien.",
    author: "Julie, 2e année à l’ESGI",
  },
  {
    message: "Le rappel IA la veille d’un exam m’a sauvé plus d’une fois 😅",
    author: "Adam, étudiant en BTS",
  },
  {
    message: "Je gagne 2h par semaine grâce aux quiz auto-générés.",
    author: "Léa, L1 Droit",
  },
];

const current = ref(0);
let intervalId: number | undefined;

function prev() {
  current.value = (current.value - 1 + testimonials.length) % testimonials.length;
}
function next() {
  current.value = (current.value + 1) % testimonials.length;
}

onMounted(() => {
  intervalId = window.setInterval(next, 8000);
});
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <section class="py-16 bg-white" id="testimonials">
    <div class="max-w-3xl mx-auto px-4 flex flex-col items-center">
      <div class="uppercase text-xs font-outfit text-gray-400 tracking-widest mb-4 text-center">
        Ils en parlent mieux que nous
      </div>
      <div class="text-4xl text-gray-200 mb-2">’’</div>
      <div class="relative min-h-[100px] w-full flex items-center justify-center mb-8">
        <Transition name="testimonial-slide" mode="out-in">
          <blockquote
            :key="current"
            class="font-encode text-2xl md:text-3xl text-black text-center font-semibold leading-snug"
          >
            {{ testimonials[current].message }}
          </blockquote>
        </Transition>
      </div>
      <div class="flex flex-col items-center gap-2 mb-8">
        <div
          class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-encode text-lg text-primary"
        >
          {{ testimonials[current].author.charAt(0) }}
        </div>
        <div class="font-outfit text-base text-gray-700 font-medium text-center">
          {{ testimonials[current].author }}
        </div>
      </div>
      <div class="flex items-center gap-6">
        <button
          @click="prev"
          class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-light hover:text-primary transition"
          aria-label="Précédent"
        >
          <ArrowIcon direction="left" size="20" />
        </button>
        <div class="flex gap-2">
          <span
            v-for="(t, i) in testimonials"
            :key="i"
            class="w-2 h-2 rounded-full"
            :class="i === current ? 'bg-primary' : 'bg-gray-300'"
          ></span>
        </div>
        <button
          @click="next"
          class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-light hover:text-primary transition"
          aria-label="Suivant"
        >
          <ArrowIcon direction="right" size="20" />
        </button>
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
.bg-primary {
  background-color: var(--color-primary);
}
.font-encode {
  font-family: var(--font-encode);
}
.font-outfit {
  font-family: var(--font-outfit);
}

/* Slide transition for testimonials */
.testimonial-slide-enter-active,
.testimonial-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}
.testimonial-slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.testimonial-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.testimonial-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.testimonial-slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
</style>
