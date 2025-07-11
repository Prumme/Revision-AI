<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import { useUserStore } from "@/stores/user";
import { PlusIcon, SearchIcon } from "lucide-vue-next";
import { useRouter } from "vue-router";
import MotionLayout from "@/components/layouts/MotionLayout.vue";

const router = useRouter();
const { getFullName } = useUserStore();

const handleCreateQuiz = () => {
  router.push({ name: "quiz-create" });
};
</script>

<template>
  <MotionLayout>
  <section class="flex flex-col gap-1.5 w-full">
    <p class="font-outfit text-lg text-black-transparent">Suivez votre parcours</p>
    <h1 class="font-outfit text-4xl font-extrabold text-black">
      Bienvenue <span class="text-primary"> {{ getFullName() }}</span> !
    </h1>
    <div class="flex justify-end w-full gap-4 mt-4">
      <Button
        @click="handleCreateQuiz"
        variant="primary"
        position-icon="right"
        class="group w-min whitespace-nowrap"
      >
        <template #icon>
          <PlusIcon class="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
        </template>
        Créez un quiz
      </Button>

      <Button variant="primary" class="group w-min whitespace-nowrap" position-icon="right">
        <template #icon>
          <SearchIcon class="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
        </template>
        Trouvez un quiz
      </Button>
    </div>

    <div class="grid grid-cols-6 gap-4 mt-8"></div>
  </section>
  </MotionLayout>
</template>
