<script setup lang="ts">
import { useRoute } from "vue-router";
import NavLink from "@/components/buttons/NavLink.vue";

const route = useRoute();
</script>

<template>
  <main class="w-screen h-screen flex">
    <nav class="w-86 h-full bg-background-alt text-foreground-alt">
      <div class="px-7 pt-14 font-outfit flex flex-col gap-3">
        <NavLink
          to="/dashboard"
          icon="House"
          text="Accueil"
          :active="route.fullPath === '/dashboard'"
        />
        <NavLink to="/exams" icon="FileQuestion" text="Quiz" :active="route.fullPath === '/quiz'" />
        <NavLink
          to="/documents"
          icon="File"
          text="Documents"
          :active="route.fullPath === '/documents'"
        />
      </div>
    </nav>

    <div class="w-full h-full overflow-scroll bg-background text-foreground pt-10 pl-20">
      <router-view></router-view>
    </div>
  </main>
</template>
