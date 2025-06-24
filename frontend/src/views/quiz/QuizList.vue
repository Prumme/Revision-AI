<script setup lang="ts">
import { Quiz, QuizService } from "@/services/quiz.service";
import { ArrowRight } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const quizzes = ref<Quiz[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const categoryColors = {
  general_history: "#46178F",
  sciences: "#1368CE",
  geography: "#26890C",
  literature: "#FFA602",
  arts: "#EB670F",
  sports: "#D60A0A",
  default: "#333333",
};

const getCategoryColor = (category: string | undefined): string => {
  if (!category) return categoryColors.default;
  return categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
};

const statusLabels = {
  pending: "En attente",
  published: "Publié",
  draft: "Brouillon",
};

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const goToQuizDetail = (id: string) => {
  router.push(`/quiz/${id}`);
};

onMounted(async () => {
  try {
    loading.value = true;
    quizzes.value = await QuizService.getQuiz();
  } catch (err) {
    console.error("Erreur lors du chargement des quiz:", err);
    error.value = "Impossible de charger les quiz. Veuillez réessayer plus tard.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Quiz de la plateforme</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div
        class="w-10 h-10 border-4 border-primary border-t-primary rounded-full animate-spin mb-4"
      ></div>
      <span class="text-gray-600">Chargement des quiz...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-100 text-red-800 px-4 py-3 rounded-md text-center">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div
      v-else-if="quizzes.length === 0"
      class="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg"
    >
      <div class="text-5xl mb-4">📚</div>
      <h2 class="text-xl font-semibold mb-2">Aucun quiz trouvé</h2>
      <p class="text-gray-600">Créez votre premier quiz pour commencer !</p>
    </div>

    <!-- Quiz Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="quiz in quizzes"
        :key="quiz.id"
        @click="goToQuizDetail(quiz.id as string)"
        class="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-200 border-t-[6px] cursor-pointer flex flex-col"
        :style="{ borderColor: getCategoryColor(quiz.category) }"
      >
        <!-- Card Header -->
        <div class="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-t-xl">
          <span
            class="text-white text-xs font-semibold px-2 py-1 rounded-full"
            :style="{ backgroundColor: getCategoryColor(quiz.category) }"
          >
            {{ quiz.category || "Non classé" }}
          </span>
          <span
            class="text-white text-xs font-semibold px-2 py-1 rounded-full"
            :class="{
              'bg-green-600': quiz.status === 'published',
              'bg-yellow-500': quiz.status === 'pending',
              'bg-gray-500': quiz.status === 'draft',
            }"
          >
            {{ statusLabels[quiz.status as keyof typeof statusLabels] || "En attente" }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="p-4 flex-1">
          <h3 class="text-lg font-bold mb-1">{{ quiz.title }}</h3>
          <p class="text-sm text-gray-600 line-clamp-2 mb-4">
            {{ quiz.description || "Aucune description" }}
          </p>
          <div class="text-xs text-gray-500 flex flex-wrap gap-4 mt-auto">
            <div class="flex items-center gap-1">
              <span>❓</span> <span>{{ quiz.questionsNumbers || 0 }} questions</span>
            </div>
            <div class="flex items-center gap-1">
              <span>🗓️</span> <span>{{ formatDate(quiz.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="flex justify-between items-center px-4 py-2 bg-gray-50 border-t">
          <span
            :class="[
              'text-xs font-medium px-2 py-1 rounded',
              quiz.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600',
            ]"
          >
            {{ quiz.isPublic ? "Public" : "Privé" }}
          </span>

          <div
            class="text-sm text-gray-500 flex items-center gap-1 group hover:text-primary transition-colors"
          >
            Voir le quiz
            <ArrowRight
              class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
