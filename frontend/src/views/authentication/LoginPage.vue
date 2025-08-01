<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import Input from "@/components/inputs/InputComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import {AuthError, useUserStore} from "@/stores/user";
import {ref} from "vue";
import {useRouter, useRoute} from "vue-router";
import MotionLayout from "@/components/layouts/MotionLayout.vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// Form props

const email = ref<string>("");
const password = ref<string>("");
const error = ref("");
const totpCode = ref<string>("");

const totpForm = ref(false);

const handleLogin = async () => {
  try {
    const loginResponse = await userStore.login({
      email: email.value,
      password: password.value,
      totpCode: totpForm.value ? totpCode.value : undefined,
    });

    if (loginResponse.totpRequired) {
      totpForm.value = true;
      return;
    }

    // Redirection vers l'URL d'origine ou vers le dashboard
    const redirectUrl = route.query.redirect as string;
    if (redirectUrl && redirectUrl !== "/login") {
      router.push(redirectUrl);
    } else {
      router.push("/dashboard");
    }
  } catch (e) {
    if (e instanceof AuthError) {
      error.value = e.message;
    } else {
      error.value = "Une erreur est survenue lors de la connexion. Veuillez réessayer.";
    }
    console.error(e);
  }
};
</script>

<template>
  <AppLayout>
    <div class="grid grid-cols-1">
      <!-- Illustration -->
      <div class="relative w-full h-screen bg-primary">
        <img
          src="../../assets/backgrounds/background_illustration.webp"
          alt="background_illustration"
          class="w-full h-full object-cover blur-sm"
        />
        <!-- Card -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <MotionLayout>
            <Card class="shadow-[0_4px_0_#000] border-2 !border-black">
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
                  <div v-if="error" class="mb-4 text-red-500 text-sm text-center">
                    {{ error }}
                  </div>
                  <template v-if="!totpForm">
                    <div class="mb-2">
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

                    <div class="mb-2">
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
                    <div class="text-right mb-4">
                      <RouterLink to="/forgot-password">
                      <span class="font-outfit text-primary hover:underline text-xs font-medium"
                      >Mot de passe oublié ?</span
                      >
                      </RouterLink>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-sm mb-3 opacity-60 text-center">
                      Vous avez activé la vérification en deux étapes.
                    </p>
                    <div class="mb-2">
                      <Input
                        v-model="totpCode"
                        label="Code de vérification"
                        placeholder="123456"
                        type="text"
                        maxlength="6"
                        class="w-full text-center"
                        required
                      />
                    </div>
                    <p class="text-xs text-gray-500 mb-4">
                      Entrez le code à 6 chiffres généré par votre application d'authentification.
                    </p>
                  </template>
                </form>
              </template>

              <template #actions>
                <div class="flex flex-col gap-2 w-full px-12">
                  <Button variant="primary" @click="handleLogin"> Se connecter</Button>
                </div>
              </template>

              <template #footer>
                <div class="w-full px-12 font-outfit">
                  <p class="text-center mt-6 text-black text-sm">
                    Vous n'avez pas de compte ?
                    <RouterLink to="/register">
                    <span class="text-primary font-medium hover:underline"
                    >Inscrivez-vous maintenant !</span
                    >
                    </RouterLink>
                  </p>
                </div>
              </template>
            </Card>
          </MotionLayout>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
