<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import Input from "@/components/inputs/InputComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { useUserStore } from "@/stores/user";
import { useDialogStore } from "@/stores/dialog";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { cguCgvCookie } from "@/assets/rgpd/cgu-cgv-cookie";

const router = useRouter();
const userStore = useUserStore();
const dialogStore = useDialogStore();

// Form props
const username = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const passwordConfirmation = ref<string>("");
const acceptTerms = ref<boolean>(false);

const error = ref("");

const showTermsModal = async () => {
  const result = await dialogStore.show({
    title: "Conditions Générales",
    message: cguCgvCookie,
    confirmText: "J'accepte",
    cancelText: "Fermer",
    type: "info",
    rawHtml: true,
  });

  if (result) {
    acceptTerms.value = true;
  }
};

const handleRegister = async () => {
  try {
    if (password.value !== passwordConfirmation.value) {
      error.value = "Les mots de passe ne correspondent pas";
      return;
    }

    if (!acceptTerms.value) {
      error.value = "Vous devez accepter les conditions générales pour vous inscrire";
      return;
    }

    await userStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    // Redirection vers la page d'accueil
    router.push("/email-send");
  } catch (e) {
    error.value = "Une erreur est survenue lors de l'inscription";
    console.error(e);
  }
};
</script>

<template>
  <AppLayout>
    <div class="relative min-h-screen flex items-center justify-center bg-gray-100">
      <!-- Background Illustration with Overlay -->
      <img
        src="../../assets/backgrounds/background_illustration.webp"
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
                Besoin de faire des révisions ?
              </h1>
              <p class="text-center text-base font-medium text-gray-700 mb-6 font-outfit">
                Transforme tes cours en quiz en un clic grâce à notre outil !
              </p>
            </motion-div>
          </template>

          <template #content>
            <motion-form
              @submit.prevent="handleRegister"
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
                  v-model="username"
                  label="Nom d'utilisateur"
                  placeholder="MyUsername123"
                  autocomplete="username"
                  class="w-full"
                  type="text"
                  required
                />
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
                  autocomplete="new-password"
                  placeholder="Mot de passe"
                  type="password"
                  required
                />
              </div>
              <div>
                <Input
                  v-model="passwordConfirmation"
                  label="Confirmation du mot de passe"
                  autocomplete="new-password"
                  placeholder="Confirmation de mot de passe"
                  type="password"
                  :show-criteria="false"
                  required
                />
              </div>
              <div class="flex items-center gap-3 mt-2 mb-4">
                <input
                  id="accept-terms"
                  v-model="acceptTerms"
                  type="checkbox"
                  class="w-4 h-4 rounded focus:ring-primary focus:ring-2 accent-primary"
                  required
                />
                <label
                  for="accept-terms"
                  class="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  J'accepte les
                  <button
                    type="button"
                    @click="showTermsModal"
                    class="text-primary hover:underline font-medium cursor-pointer"
                  >
                    CGU, CGV et politique des cookies
                  </button>
                  *
                </label>
              </div>
              <motion-div :whileHover="{ scale: 1.04 }" :whileTap="{ scale: 0.98 }">
                <Button variant="primary" class="w-full py-2 text-lg font-bold transition-all duration-150" @click="handleRegister">
                  S'enregistrer
                </Button>
              </motion-div>
            </motion-form>
          </template>

          <template #footer>
            <motion-div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" transition="{ delay: 0.3 }">
              <div class="flex justify-center w-full font-outfit">
                <p class="text-center mt-6 text-black text-sm">
                  Vous avez déjà un compte ?
                  <RouterLink to="/login">
                    <span class="text-primary font-medium hover:underline transition-colors">Connectez-vous maintenant !</span>
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
