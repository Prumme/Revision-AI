<script setup lang="ts">
import { ref, onMounted } from "vue";
import { QuizService } from "@/services/quiz.service";
import { useUserStore } from "@/stores/user";
import AutoFileIcon from "../icons/AutoFileIcon.vue";
import ButtonComponent from "../buttons/ButtonComponent.vue";
import { useRouter } from "vue-router";
import type { UploadedDocument } from "@/types/uploadedDocument.ts";
import { humanizeBytes } from "@/utils/humanizeBytes.ts";

const userStore = useUserStore();
const user = userStore.user;
const mediaQuizList = ref<UploadedDocument[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const navigate = useRouter().push;

onMounted(async () => {
  if (!user?.id) return;
  loading.value = true;
  try {
    const res = await QuizService.getUserQuizzes(user.id);
    const quizzes = Array.isArray(res) ? res : res?.data || [];
    mediaQuizList.value = quizzes.flatMap((q) => q.media);
  } catch {
    error.value = "Impossible de charger les documents.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-3xl font-bold mb-5">Mes documents</h2>
    <div v-if="loading" class="text-gray-500">Chargement...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="mediaQuizList.length === 0" class="text-lg text-gray-600">
      Aucun document importé pour le moment.
    </div>
    <ul v-else class="divide-y divide-gray-200">
      <li
        v-for="mediaQuiz in mediaQuizList"
        :key="mediaQuiz.identifier"
        class="flex items-center gap-4 py-3"
      >
        <AutoFileIcon :mime-type="mediaQuiz.mimeType" class="w-7 h-7 text-primary" />
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-900 truncate">{{ mediaQuiz.name }}</div>
          <div class="text-xs text-gray-500 break-all">
            {{ mediaQuiz.size ? humanizeBytes(mediaQuiz.size) : "Taille inconnue" }}
          </div>
        </div>
        <ButtonComponent
          :href="mediaQuiz.identifier"
          target="_blank"
          rel="noopener"
          class="ml-4 text-xs"
          @click.prevent="() => navigate(mediaQuiz.identifier)"
        >
          Ouvrir
        </ButtonComponent>
      </li>
    </ul>
  </div>
</template>
