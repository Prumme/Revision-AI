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
    if (e instanceof Error) {
      error.value = e.message;
    } else {
      error.value = "Une erreur est survenue lors de l'inscription";
    }
  }
};
</script>

<template>
  <AppLayout>
    <!-- Layout Simple -->
    <div class="grid grid-cols-1">
      <!-- Illustration -->
      <div class="relative w-full h-screen bg-primary">
        <!-- Card -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Card class="shadow-[0_4px_0_#000] border-2 !border-black">
            <template #header>
              <h1
                class="text-center text-black text-lg lg:text-3xl mb-2 font-encode font-extrabold whitespace-pre"
              >
                Besoin de faire des révisions ?
              </h1>
              <p class="text-center text-sm font-medium text-gray-700 mb-6 font-outfit">
                Transforme tes cours en quiz en un clic grâce à notre outil !
              </p>
            </template>

            <template #content>
              <form
                @submit.prevent="handleRegister"
                class="flex flex-col justify-center w-full px-2 lg:px-12"
              >
                <div v-if="error" class="mb-4 text-red-500 text-sm text-center">
                  {{ error }}
                </div>

                <div class="mb-2">
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
                    autocomplete="new-password"
                    placeholder="Mot de passe"
                    type="password"
                    required
                  />
                </div>

                <div class="mb-6">
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

                <!-- Checkbox opt-in pour les conditions générales -->
                <div class="mb-8">
                  <div class="flex items-center gap-3">
                    <input
                      id="accept-terms"
                      v-model="acceptTerms"
                      type="checkbox"
                      class="w-4 h-4 rounded focus:ring-primary focus:ring-2"
                      style="accent-color: var(--color-primary)"
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
                </div>
              </form>
            </template>

            <template #actions>
              <div class="flex flex-col gap-2 w-full px-12">
                <Button variant="primary" @click="handleRegister" tracking_event="register_account">
                  S'enregistrer
                </Button>
              </div>
            </template>

            <template #footer>
              <div class="flex justify-center w-full font-outfit">
                <p class="text-center mt-6 text-black text-sm">
                  Vous avez déjà un compte ?
                  <RouterLink to="/login">
                    <span class="text-primary font-medium hover:underline"
                      >Connectez-vous maintenant !</span
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
