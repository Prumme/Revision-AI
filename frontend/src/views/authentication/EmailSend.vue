<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import AppLayout from "@/components/layouts/AppLayout.vue";
import { Send } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

const handleGoToLogin = () => {
  router.push("/login");
};
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
                <div class="bg-primary/10 p-4 rounded-full">
                  <Send class="w-12 h-12 text-primary" />
                </div>
                <h1
                  class="text-center text-black text-lg lg:text-3xl font-encode font-extrabold whitespace-pre"
                >
                  Email de vérification envoyé !
                </h1>
              </div>
            </template>
            <template #content>
              <div class="flex flex-col items-center gap-6">
                <p class="text-center text-sm font-medium text-gray-700 font-outfit">
                  Un email de vérification a été envoyé à votre adresse email. Veuillez vérifier
                  votre boîte de réception et cliquer sur le lien pour activer votre compte.
                  <br /><br />
                  Vous pouvez fermer cette page et revenir plus tard, ou vous connecter une fois que
                  vous aurez vérifié votre email.
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
