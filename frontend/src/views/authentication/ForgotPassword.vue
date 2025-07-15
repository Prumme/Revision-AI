<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import Input from "@/components/inputs/InputComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { Send } from "lucide-vue-next";
import { ApiService } from "@/services/api.service";
import { ref } from "vue";
import { useRouter } from "vue-router";
import MotionLayout from "@/components/layouts/MotionLayout.vue";

// Form props
const email = ref("");
const isEmailSent = ref(false);

const router = useRouter();

const handleForgotPassword = async () => {
  console.log(email.value);
  const response = await ApiService.post(
    "/auth/forgot-password",
    {
      email: email.value,
    },
    false,
  );
  if (response.status === 200) {
    isEmailSent.value = true;
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
          class="w-full h-full object-cover blur-sm"
        />
        <!-- Card -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <MotionLayout>
            <Card v-if="!isEmailSent" class="shadow-[0_4px_0_#000] border-2 !border-black">
              <template #header>
                <h1
                  class="text-center text-black text-lg lg:text-3xl mb-2 font-encode font-extrabold whitespace-pre"
                >
                  T'as perdu ton mot de passe ?
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
                  <Button
                    tracking_event="forgot_password"
                    @click="handleForgotPassword"
                    variant="primary"
                    >Envoyer le lien</Button
                  >
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

            <Card
              v-else
              class="flex flex-col items-center justify-center shadow-[0_4px_0_#000] border-2 !border-black"
            >
              <template #header>
                <div class="flex flex-col items-center gap-4">
                  <div class="bg-primary/10 p-4 rounded-full">
                    <Send class="w-12 h-12 text-primary" />
                  </div>
                  <h1
                    class="text-center text-black text-lg lg:text-3xl font-encode font-extrabold whitespace-pre"
                  >
                    Email de réinitialisation envoyé !
                  </h1>
                </div>
                <p class="text-center text-sm font-medium text-gray-700 mb-6 font-outfit">
                  Veuillez vérifier votre email pour réinitialiser votre mot de passe.
                </p>
              </template>
              <template #content>
                <div class="flex flex-col items-center gap-6">
                  <p class="text-center text-sm font-medium text-gray-700 font-outfit">
                    Un email de vérification a été envoyé à votre adresse email. Veuillez vérifier
                    votre boîte de réception et cliquer sur le lien pour réinitialiser votre mot de
                    passe.
                  </p>
                  <div class="flex flex-col w-full gap-3">
                    <Button @click="handleGoToLogin" variant="primary" class="w-full">
                      Aller à la page de connexion
                    </Button>
                  </div>
                </div>
              </template>
            </Card>
          </MotionLayout>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
