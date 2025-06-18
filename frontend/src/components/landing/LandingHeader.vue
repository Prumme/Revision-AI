<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";

const menuOpen = ref(false);
function closeMenu() {
  menuOpen.value = false;
}
</script>

<template>
  <header class="sticky top-0 z-30 bg-white shadow-md">
    <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
      <!-- Logo -->
      <a href="/" class="font-encode font-bold text-2xl text-black tracking-tight">
        Revision<span class="text-primary">AI</span>
      </a>

      <!-- Desktop navigation -->
      <ul class="hidden md:flex items-center gap-8 font-outfit text-base">
        <li>
          <a href="#fonctionnalites" class="hover:text-primary transition">Fonctionnalités</a>
        </li>
        <li><a href="#tarifs" class="hover:text-primary transition">Tarifs</a></li>
        <li><a href="#partenaires" class="hover:text-primary transition">Partenaires</a></li>
        <li><a href="#faq" class="hover:text-primary transition">FAQ</a></li>
      </ul>

      <!-- Desktop actions -->
      <div class="hidden md:flex items-center gap-4">
        <RouterLink to="/login" class="font-outfit font-medium hover:text-primary transition"
          >Connexion</RouterLink
        >
        <RouterLink to="/register">
          <ButtonComponent variant="primary"> Créer un compte </ButtonComponent>
        </RouterLink>
      </div>

      <!-- Hamburger (mobile) -->
      <button
        class="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
        @click="menuOpen = true"
        aria-label="Ouvrir le menu"
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h20M4 16h20" />
        </svg>
      </button>
    </nav>

    <!-- Mobile menu slide-in -->
    <transition name="slide">
      <div v-if="menuOpen" class="fixed inset-0 z-40 bg-black/40" @click.self="menuOpen = false">
        <aside
          class="absolute top-0 right-0 w-64 h-full bg-white shadow-lg flex flex-col p-6 gap-6 animate-slide-in"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-encode font-bold text-xl text-black"
              >Revision<span class="text-primary">AI</span></span
            >
            <button @click="menuOpen = false" aria-label="Fermer le menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
          <ul class="flex flex-col gap-4 font-outfit text-lg">
            <li><a href="#fonctionnalites" @click="closeMenu">Fonctionnalités</a></li>
            <li><a href="#tarifs" @click="closeMenu">Tarifs</a></li>
            <li><a href="#partenaires" @click="closeMenu">Partenaires</a></li>
            <li><a href="#faq" @click="closeMenu">FAQ</a></li>
          </ul>
          <div class="flex flex-col gap-3 mt-4">
            <RouterLink to="/login" class="font-outfit font-medium" @click="closeMenu"
              >Connexion</RouterLink
            >
            <RouterLink to="/register" @click="closeMenu">
              <ButtonComponent variant="primary" class="w-full"> Créer un compte </ButtonComponent>
            </RouterLink>
          </div>
        </aside>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.text-primary {
  color: var(--color-primary);
}
.bg-primary {
  background-color: var(--color-primary);
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.animate-slide-in {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
