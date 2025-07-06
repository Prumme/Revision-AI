<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import Input from "@/components/inputs/InputComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

// Form props

const email = ref<string>("");
const password = ref<string>("");
const error = ref("");

const handleLogin = async () => {
  try {
    await userStore.login({
      email: email.value,
      password: password.value,
    });

    // Redirection vers la page d'accueil
    router.push("/dashboard");
  } catch (e) {
    if (e instanceof Error && e.message === "Email not verified, please verify your email") {
      error.value = "Email non vérifié, veuillez vérifier votre email";
    } else {
      error.value = "Email ou mot de passe incorrect";
    }
    console.error(e);
  }
};
</script>

<template>
  <AppLayout>
    <div class="relative min-h-screen flex items-center justify-center bg-gray-100">
      <!-- Background Illustration with Overlay -->
      <img
        src="@/assets/backgrounds/background_illustration.webp"
        alt="background_illustration"
        class="fixed inset-0 w-full h-full object-cover z-0"
      />
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-10"></div>
      <!-- Centered Card with Motion -->
      <motion-div
        class="relative z-20 flex flex-col items-center justify-center w-full min-h-screen px-2"
        :initial="{ opacity: 0, y: 40 }"
        :animate="{ opacity: 1, y: 0 }"
        transition="{ type: 'spring', stiffness: 80, damping: 18 }"
      >
        <Card class="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-3xl shadow-xl bg-white/90 backdrop-blur-lg border border-gray-200 px-6 py-8 flex flex-col items-center transition-all duration-300">
          <template #header>
            <motion-div :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }" transition="{ delay: 0.1 }">
              <h1
                class="text-center text-black text-2xl lg:text-3xl mb-2 font-encode font-extrabold whitespace-pre drop-shadow-sm"
              >
                Prêt à booster tes révisions ?
              </h1>
              <p class="text-center text-base font-medium text-gray-700 mb-6 font-outfit">
                Connecte-toi et transforme tes cours en quiz en un clic.
              </p>
            </motion-div>
          </template>
          <template #content>
            <motion-form
              @submit.prevent="handleLogin"
              class="flex flex-col justify-center w-full gap-3"
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              transition="{ delay: 0.2 }"
            >
              <div v-if="error" class="mb-2 text-red-500 text-sm text-center animate-pulse">
                {{ error }}
              </div>
              <div>
                <Input
                  v-model="email"
                  label="Adresse email"
                  autocomplete="email"
                  placeholder="john.doe@gmail.com"
                  class="w-full"
                  type="email"
                  required
                />
              </div>
              <div>
                <Input
                  v-model="password"
                  label="Mot de passe"
                  autocomplete="current-password"
                  placeholder="Mot de passe"
                  type="password"
                  :show-criteria="false"
                  required
                />
              </div>
              <div class="text-right mb-2">
                <RouterLink to="/forgot-password">
                  <span class="font-outfit text-primary hover:underline text-xs font-medium transition-colors"
                    >Mot de passe oublié ?</span
                  >
                </RouterLink>
              </div>
              <motion-div :whileHover="{ scale: 1.04 }" :whileTap="{ scale: 0.98 }">
                <Button variant="primary" class="w-full py-2 text-lg font-bold transition-all duration-150" @click="handleLogin">
                  Se connecter
                </Button>
              </motion-div>
            </motion-form>
          </template>
          <template #footer>
            <motion-div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" transition="{ delay: 0.3 }">
              <div class="flex justify-center w-full font-outfit">
                <p class="text-center mt-6 text-black text-sm">
                  Vous n'avez pas de compte ?
                  <RouterLink to="/register">
                    <span class="text-primary font-medium hover:underline transition-colors">Inscrivez-vous maintenant !</span>
                  </RouterLink>
                </p>
              </div>
            </motion-div>
          </template>
        </Card>
      </motion-div>
    </div>
  </AppLayout>
</template>
