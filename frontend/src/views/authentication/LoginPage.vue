<template>
  <AppLayout>
    <div class="grid grid-cols-1">
      <!-- Illustration -->
      <div class="relative w-full h-screen">
        <img
          src="../../assets/backgrounds/background_illustration.webp"
          alt="background_illustration"
          class="w-full h-full object-cover"
        />
        <!-- Card -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Card>
            <template #header>
              <h1
                class="text-center text-black text-lg lg:text-3xl mb-2 font-encode font-extrabold whitespace-pre"
              >
                Prêt à booster tes révisions ?
              </h1>
              <p class="text-center text-sm font-medium text-gray-700 mb-6 font-outfit">
                Connecte-toi et transforme tes cours en quiz en un clic.
              </p>
            </template>
            <template #content>
              <form
                @submit.prevent="handleLogin"
                class="flex flex-col justify-center w-full px-2 lg:px-12"
              >
                <div class="mb-2">
                  <Input
                    v-model="email"
                    label="Adresse email"
                    autocomplete="email"
                    placeholder="john.doe@gmail.com"
                    class="w-full"
                    type="email"
                  />
                </div>

                <div class="mb-2">
                  <Input
                    v-model="password"
                    label="Mot de passe"
                    autocomplete="current-password"
                    placeholder="Mot de passe"
                    type="password"
                    :show-criteria="false"
                  />
                </div>
                <div class="text-right mb-4">
                  <RouterLink to="/forgot-password">
                    <span class="font-outfit text-primary hover:underline text-xs font-medium"
                      >Mot de passe oublié ?</span
                    >
                  </RouterLink>
                </div>
              </form>
            </template>

            <template #actions>
              <div class="flex flex-col gap-2 w-full px-12">
                <Button variant="primary"> Se connecter </Button>
              </div>
            </template>

            <template #footer>
              <div class="w-full px-12 font-outfit">
                <p class="text-center mt-6 text-black text-sm">
                  Vous n’avez pas de compte ?
                  <RouterLink to="/register">
                    <span class="text-primary font-medium hover:underline"
                      >Inscrivez-vous maintenant !</span
                    >
                  </RouterLink>
                </p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import Input from "@/components/inputs/InputComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { ref } from "vue";

// Form props
const email = ref("");
const password = ref("");

const handleLogin = () => {
  console.log("Login");
};
</script>
