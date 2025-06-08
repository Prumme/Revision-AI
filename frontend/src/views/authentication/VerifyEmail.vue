<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { CheckCircleIcon, XCircleIcon } from "lucide-vue-next";
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { API_URL } from "@/config/api";

const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const error = ref<string | null>(null);
const isVerified = ref(false);

const handleGoToLogin = () => {
  router.push("/login");
};

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    error.value = "Token de vérification manquant";
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Le lien de vérification est invalide ou a expiré");
    }

    isVerified.value = true;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Une erreur est survenue";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <AppLayout>
    <div class="grid grid-cols-1">
      <div class="relative w-full h-screen">
        <img
          src="../../assets/backgrounds/background_illustration.webp"
          alt="background_illustration"
          class="w-full h-full object-cover"
        />
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Card>
            <template #header>
              <div class="flex flex-col items-center gap-4">
                <div v-if="isLoading" class="animate-pulse bg-gray-200 rounded-full p-4">
                  <div class="w-12 h-12"></div>
                </div>
                <div v-else-if="error" class="bg-error/10 p-4 rounded-full">
                  <XCircleIcon class="w-12 h-12 text-error" />
                </div>
                <div v-else class="bg-success/10 p-4 rounded-full">
                  <CheckCircleIcon class="w-12 h-12 text-success" />
                </div>

                <h1
                  class="text-center text-black text-lg lg:text-3xl font-encode font-extrabold whitespace-pre"
                >
                  <template v-if="isLoading"> Vérification en cours... </template>
                  <template v-else-if="error"> Échec de la vérification </template>
                  <template v-else> Email vérifié avec succès ! </template>
                </h1>
              </div>
            </template>
            <template #content>
              <div class="flex flex-col items-center gap-6">
                <p class="text-center text-sm font-medium text-gray-700 font-outfit">
                  <template v-if="isLoading">
                    Nous vérifions votre adresse email, veuillez patienter...
                  </template>
                  <template v-else-if="error">
                    {{ error }}
                  </template>
                  <template v-else>
                    Votre compte a été activé. Vous pouvez maintenant vous connecter et commencer à
                    utiliser Revision AI.
                  </template>
                </p>
                <Button v-if="!isLoading" @click="handleGoToLogin" class="w-full">
                  Se connecter
                </Button>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
