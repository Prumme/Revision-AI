<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Card from "@/components/cards/CardComponent.vue";
import MotionLayout from "@/components/layouts/MotionLayout.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <MotionLayout>
    <div class="flex items-center justify-center min-h-[80vh] w-full h-screen overflow-hidden">
      <Card class="shadow-[0_4px_0_#000] border-2 !border-black max-w-md w-full">
        <template #header>
          <div class="text-center">
            <div class="text-6xl mb-4">🚀</div>
            <h1 class="text-4xl font-bold text-primary mb-2">Bientôt disponible !</h1>
            <h2 class="text-xl font-semibold mb-2">Cette fonctionnalité arrive</h2>
          </div>
        </template>

        <template #content>
          <div class="text-center">
            <p class="text-foreground-alt mb-4">
              Nous travaillons dur pour vous apporter cette nouvelle fonctionnalité.
            </p>
            <p class="text-foreground-alt mb-6">
              Restez connecté·e pour être informé·e de sa sortie !
            </p>
          </div>
        </template>

        <template #footer>
          <div class="flex gap-3 justify-center">
            <Button @click="goBack" variant="outline">
              Retour
            </Button>
            <router-link to="/dashboard">
              <Button>
                Dashboard
              </Button>
            </router-link>
          </div>
        </template>
      </Card>
    </div>
  </MotionLayout>
</template>
