s
<script setup lang="ts">
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import Dropdown from "@/components/dropdowns/DropdownInput.vue";
import ProfileComponent from "@/components/profile/ProfileComponent.vue";
import { useUserStore } from "@/stores/user";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-vue-next";
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AvatarComponent from "../../components/profile/avatar/AvatarComponent.vue";

const router = useRouter();
const userStore = useUserStore();
const user = userStore?.user;
const menuOpen = ref(false);
function closeMenu() {
  menuOpen.value = false;
}

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

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    smoothScrollTo(el, 1000);
    closeMenu();
  } else {
    // Si l'élément n'existe pas, rediriger vers la page d'accueil avec l'ancre
    router.push({ path: "/", hash: `#${id}` });
    closeMenu();
  }
}

const showHeader = ref(true);
let lastScrollY = window.scrollY;

function handleScroll() {
  const currentScrollY = window.scrollY;
  if (currentScrollY <= 0) {
    showHeader.value = true;
  } else if (currentScrollY > lastScrollY) {
    // Scroll down
    showHeader.value = false;
  } else {
    // Scroll up
    showHeader.value = true;
  }
  lastScrollY = currentScrollY;
}

const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header
    class="sticky top-0 z-30 bg-white shadow-md transition-transform duration-300"
    :class="{ '-translate-y-full': !showHeader }"
  >
    <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
      <!-- Logo -->
      <a href="/" class="font-encode font-bold text-2xl text-black tracking-tight">
        Revision<span class="text-primary">AI</span>
      </a>

      <!-- Desktop navigation -->
      <ul class="hidden md:flex items-center gap-8 font-outfit text-base">
        <li>
          <a
            href="/#fonctionnalites"
            @click.prevent="scrollTo('fonctionnalites')"
            class="hover:text-primary transition"
            >Fonctionnalités</a
          >
        </li>
        <li>
          <a
            href="/#tarifs"
            @click.prevent="scrollTo('tarifs')"
            class="hover:text-primary transition"
            >Tarifs</a
          >
        </li>
        <li>
          <a
            href="/#partenaires"
            @click.prevent="scrollTo('partenaires')"
            class="hover:text-primary transition"
            >Partenaires</a
          >
        </li>
        <li>
          <a href="/#faq" @click.prevent="scrollTo('faq')" class="hover:text-primary transition"
            >FAQ</a
          >
        </li>
      </ul>

      <!-- Desktop actions -->
      <div v-if="!user" class="hidden md:flex items-center gap-4">
        <RouterLink to="/login" class="font-outfit font-medium hover:text-primary transition"
          >Connexion</RouterLink
        >
        <RouterLink to="/register">
          <ButtonComponent variant="primary"> Créer un compte </ButtonComponent>
        </RouterLink>
      </div>

      <div v-else class="hidden md:flex items-center gap-4 font-outfit">
        <Dropdown position="top-right">
          <template #trigger>
            <ProfileComponent :isSidebarOpen="menuOpen" :icon="true" />
          </template>

          <template #menus>
            <ProfileComponent :isSidebarOpen="menuOpen" :icon="false" class="block px-4 py-4" />
            <a href="/profile" class="block px-4 py-2 text-gray-light hover:bg-gray-100"
              >Mon profil</a
            >
            <a href="/coming-soon" class="block px-4 py-2 text-gray-light hover:bg-gray-100">Boutique</a>
            <a href="/coming-soon" class="block px-4 py-2 text-gray-light hover:bg-gray-100">Paramètres</a>
            <span
              class="block px-4 py-2 mb-2 text-gray-light hover:bg-gray-100"
              @click="handleLogout"
            >
              <LogOutIcon class="inline-block mr-2 h-4 w-4 text-gray-light" />
              Se déconnecter
            </span>
          </template>
        </Dropdown>
      </div>

      <!-- Hamburger (mobile) -->
      <nav class="md:hidden flex items-center justify-center p-2 rounded focus:outline-none">
        <component
          :is="menuOpen ? XIcon : MenuIcon"
          class="h-6 w-6 text-foreground-alt hover:text-primary cursor-pointer"
          @click="menuOpen = !menuOpen"
        />
      </nav>
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
            <li>
              <a href="/#fonctionnalites" @click.prevent="scrollTo('fonctionnalites')"
                >Fonctionnalités</a
              >
            </li>
            <li>
              <a href="/#tarifs" @click.prevent="scrollTo('tarifs')">Tarifs</a>
            </li>
            <li>
              <a href="/#partenaires" @click.prevent="scrollTo('partenaires')">Partenaires</a>
            </li>
            <li>
              <a href="/#faq" @click.prevent="scrollTo('faq')">FAQ</a>
            </li>
          </ul>
          <div v-if="!user" class="flex flex-col gap-3 mt-4">
            <RouterLink to="/login" class="font-outfit font-medium" @click="closeMenu"
              >Connexion</RouterLink
            >
            <RouterLink to="/register" @click="closeMenu">
              <ButtonComponent variant="primary" class="w-full"> Créer un compte </ButtonComponent>
            </RouterLink>
          </div>

          <div v-else class="flex flex-col justify-center items-center gap-4">
            <RouterLink to="/profile" class="font-outfit font-medium hover:text-primary transition">
              <AvatarComponent
                :user="user"
                class="w-8 h-8 rounded-full border border-gray-300 transition-all"
              />
            </RouterLink>
            <RouterLink to="/logout">
              <ButtonComponent variant="secondary"> Déconnexion </ButtonComponent>
            </RouterLink>
          </div>
        </aside>
      </div>
    </transition>
  </header>
</template>

<style scoped>
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
