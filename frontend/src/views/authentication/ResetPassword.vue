<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import Input from "@/components/inputs/InputComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { CheckCircle, AlertCircle } from "lucide-vue-next";
import { ApiService } from "@/services/api.service";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

// Form props
const newPassword = ref("");
const confirmPassword = ref("");
const token = ref("");
const isPasswordReset = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const route = useRoute();
const router = useRouter();

onMounted(() => {
  // Récupérer le token depuis l'URL
  token.value = route.query.token as string;
  if (!token.value) {
    router.push("/login");
  }
});

const handleResetPassword = async () => {
  // Validation des mots de passe
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas";
    return;
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = "Le mot de passe doit contenir au moins 6 caractères";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await ApiService.post(
      "/auth/reset-password",
      {
        token: token.value,
        newPassword: newPassword.value,
      },
      false,
    );

    if (response.status === 200) {
      isPasswordReset.value = true;
    }
  } catch (error) {
    if (error.response?.status === 400) {
      errorMessage.value = "Le lien de réinitialisation a expiré";
    } else if (error.response?.status === 401) {
      errorMessage.value = "Lien de réinitialisation invalide";
    } else {
      errorMessage.value = "Une erreur s'est produite. Veuillez réessayer.";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleGoToLogin = () => {
  router.push("/login");
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
          <Card v-if="!isPasswordReset" class="shadow-[0_4px_0_#000] border-2 !border-black">
            <template #header>
              <h1
                class="text-center text-black text-lg lg:text-3xl mb-2 font-encode font-extrabold whitespace-pre"
              >
                Réinitialise ton mot de passe
              </h1>
              <p class="text-center text-sm font-medium text-gray-700 mb-6 font-outfit">
                Saisis ton nouveau mot de passe pour accéder à ton compte.
              </p>
            </template>
            <template #content>
              <form
                @submit.prevent="handleResetPassword"
                class="flex flex-col justify-center w-full px-2 lg:px-12"
              >
                <div class="mb-6">
                  <Input
                    v-model="newPassword"
                    label="Nouveau mot de passe"
                    autocomplete="new-password"
                    placeholder="Saisissez votre nouveau mot de passe"
                    class="w-full"
                    type="password"
                    :required="true"
                  />
                </div>
                <div class="mb-6">
                  <Input
                    v-model="confirmPassword"
                    label="Confirmer le mot de passe"
                    autocomplete="new-password"
                    placeholder="Confirmez votre nouveau mot de passe"
                    class="w-full"
                    type="password"
                    :showCriteria="false"
                    :required="true"
                  />
                </div>

                <!-- Message d'erreur -->
                <div
                  v-if="errorMessage"
                  class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
                >
                  <div class="flex items-center">
                    <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
                    <p class="text-sm text-red-600 font-medium">{{ errorMessage }}</p>
                  </div>
                </div>
              </form>
            </template>

            <template #actions>
              <div class="flex flex-col gap-2 w-full px-12">
                <Button
                  tracking_event="reset_password"
                  @click="handleResetPassword"
                  variant="primary"
                  :loading="isLoading"
                  :disabled="isLoading"
                >
                  {{ isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe" }}
                </Button>
              </div>
            </template>

            <template #footer>
              <div class="w-full px-12">
                <div class="font-outfit">
                  <p class="text-center mt-6 text-sm">
                    Vous vous souvenez de votre mot de passe ?
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

          <Card
            v-else
            class="flex flex-col items-center justify-center shadow-[0_4px_0_#000] border-2 !border-black"
          >
            <template #header>
              <div class="flex flex-col items-center gap-4">
                <div class="bg-green-100 p-4 rounded-full">
                  <CheckCircle class="w-12 h-12 text-green-600" />
                </div>
                <h1
                  class="text-center text-black text-lg lg:text-3xl font-encode font-extrabold whitespace-pre"
                >
                  Mot de passe réinitialisé !
                </h1>
              </div>
              <p class="text-center text-sm font-medium text-gray-700 mb-6 font-outfit">
                Votre mot de passe a été mis à jour avec succès.
              </p>
            </template>
            <template #content>
              <div class="flex flex-col items-center gap-6">
                <p class="text-center text-sm font-medium text-gray-700 font-outfit">
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous
                  connecter avec votre nouveau mot de passe.
                </p>
                <div class="flex flex-col w-full gap-3">
                  <Button @click="handleGoToLogin" variant="primary" class="w-full">
                    Aller à la page de connexion
                  </Button>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
