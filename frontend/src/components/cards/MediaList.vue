<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { QuizService } from '@/services/quiz.service';
import { useUserStore } from '@/stores/user';
import { FileIcon } from 'lucide-vue-next';

const userStore = useUserStore();
const user = userStore.user;
const mediaQuizList = ref<{ media: string, quizTitle: string }[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  if (!user?.id) return;
  loading.value = true;
  try {
    const res = await QuizService.getUserQuizzes(user.id);
    const quizzes = Array.isArray(res) ? res : (res?.data || []);
    mediaQuizList.value = quizzes
      .filter(q => Array.isArray(q.media) && q.media.length > 0)
      .flatMap(q => q.media.map(m => ({ media: m, quizTitle: q.title })));
  } catch {
    error.value = 'Impossible de charger les documents.';
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
    <div v-else-if="mediaQuizList.length === 0" class="text-lg text-gray-600">Aucun document importé pour le moment.</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
      <div
        v-for="mediaQuiz in mediaQuizList"
        :key="mediaQuiz.media"
        class="relative group rounded-2xl flex items-center gap-4 aspect-[3/1] overflow-hidden transition-all duration-100 shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:cursor-pointer hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-none border-2 hover:border-black focus-within:border-black/40"
      >
        <FileIcon class="w-10 h-10 text-primary ml-4" />
        <div class="flex-1 min-w-0">
          <div class="font-bold text-lg text-gray-900 truncate">{{ mediaQuiz.quizTitle }}</div>
          <div class="text-xs text-gray-500 break-all">{{ mediaQuiz.media }}</div>
        </div>
        <a
          :href="mediaQuiz.media"
          target="_blank"
          rel="noopener"
          class="px-4 py-1 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-dark transition whitespace-nowrap mr-4"
        >
          Ouvrir
        </a>
      </div>
    </div>
  </div>
</template>
