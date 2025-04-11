<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import Input from "@/components/inputs/InputComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { ref } from "vue";

// Form props
const email = ref("");

const handleForgotPassword = () => {
  console.log("Forgot Password");
};
</script>

<template>
  <AppLayout>
    <!-- Layout Simple -->
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
                T’as perdu ton mot de passe ?
              </h1>
              <p class="text-center text-sm font-medium text-gray-700 mb-6 font-outfit">
                Connecte-toi et transforme tes cours en quiz en un clic.
              </p>
            </template>
            <template #content>
              <form
                @submit.prevent="handleForgotPassword"
                class="flex flex-col justify-center w-full px-2 lg:px-12"
              >
                <div class="mb-8">
                  <Input
                    v-model="email"
                    label="Adresse email"
                    autocomplete="email"
                    placeholder="john.doe@gmail.com"
                    class="w-full"
                    type="email"
                  />
                </div>
              </form>
            </template>

            <template #actions>
              <div class="flex flex-col gap-2 w-full px-12">
                <Button variant="primary">Envoyer le lien</Button>
              </div>
            </template>

            <template #footer>
              <div class="w-full px-12">
                <div class="font-outfit">
                  <p class="text-center mt-6 text-sm">
                    Vous avez déjà un compte ?
                    <RouterLink to="/login">
                      <span class="text-primary font-medium hover:underline"
                        >Connectez-vous maintenant !</span
                      >
                    </RouterLink>
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
