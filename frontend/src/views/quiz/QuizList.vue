<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import SearchBarComponent from "@/components/inputs/SearchBarComponent.vue";
import Select from "@/components/inputs/SelectComponent.vue";
import Switch from "@/components/inputs/SwitchComponent.vue";
import QuizLoadingSpinner from "@/components/loaders/QuizLoadingSpinner.vue";
import { Quiz, QuizService } from "@/services/quiz.service";
import { useQuizLoadingStore } from "@/stores/quizLoading";
import { useUserStore } from "@/stores/user";
import { ArrowRight, Calendar, FileQuestion, PlusIcon } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Motion } from '@motionone/vue';

const router = useRouter();
const userStore = useUserStore();
const quizLoadingStore = useQuizLoadingStore();
const user = userStore.user;

const search = ref("");
const selectedCategory = ref("");
const isPublic = ref<null | boolean>(null);

const page = ref(1);
const limit = ref(8);
const total = ref(0);
const totalPages = ref(1);

const quizzes = ref<Quiz[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const categoryColors = {
  general_history: "#e5d5f7",
  sciences: "#cce4f6",
  geography: "#daf5e2",
  literature: "#fdf4cc",
  arts: "#f9d0d0",
  sports: "#e5d5f7",
  default: "#e5e5e5",
};

const categoryLabels: Record<string, string> = {
  general_history: "Histoire générale",
  sciences: "Sciences",
  geography: "Géographie",
  mathematics: "Mathématiques",
  literature: "Littérature",
  arts: "Arts",
  sports: "Sports",
  "": "Non classé",
};

function hexToRgba(hex: string, alpha: number) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getCategoryColor(category?: string): string {
  const baseColor =
    categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
  return hexToRgba(baseColor, 0.6);
}

function getCategoryLabel(category?: string): string {
  return categoryLabels[category || ""] || category || "Non classé";
}

function formatDate(dateString?: string | Date): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function goToQuizDetail(id: string) {
  router.push(`/quiz/${id}`);
}

async function fetchQuizzes() {
  if (!user?.id) return;
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 900)); // Faux temps de chargement
    const filters: Record<string, unknown> = {};
    if (search.value) filters.search = search.value;
    if (selectedCategory.value) filters.category = selectedCategory.value;
    if (isPublic.value !== null) filters.isPublic = isPublic.value;
    const pagination = { page: page.value, limit: limit.value };
    const res = await QuizService.getUserQuizzes(user.id, filters, pagination);
    console.log("res from getUserQuizzes", res);
    if (Array.isArray(res)) {
      quizzes.value = res;
      total.value = res.length;
      totalPages.value = 1;
    } else if (res && Array.isArray(res.data)) {
      quizzes.value = res.data;
      total.value = res.total ?? res.data.length ?? 0;
      totalPages.value = res.totalPages ?? 1;
    } else {
      quizzes.value = [];
      total.value = 0;
      totalPages.value = 1;
    }
  } catch {
    error.value = "Impossible de charger les quiz. Veuillez réessayer plus tard.";
  } finally {
    loading.value = false;
  }
}

import { watch } from "vue";
watch([search, selectedCategory, isPublic, page, limit], fetchQuizzes);

watch(
  () => quizLoadingStore.quizStatus,
  (newStatus) => {
    if (newStatus === "completed" && quizLoadingStore.currentQuizId) {
      setTimeout(() => {
        router.push(`/quiz/${quizLoadingStore.currentQuizId}`);
      }, 1000);
    }
  },
);

onMounted(async () => {
  await fetchQuizzes();
});
</script>

<template>
  <section class="flex flex-col gap-1.5 w-full">
    <p class="font-outfit text-lg text-black-transparent">Tous vos quiz</p>
    <h1 class="font-outfit text-4xl font-extrabold text-black">
      Liste des quiz
    </h1>
    <div class="flex justify-end w-full gap-4 mt-4 mb-8">
      <Button
        @click="router.push('/quiz/create')"
        variant="primary"
        position-icon="right"
        class="group w-min whitespace-nowrap"
      >
        <template #icon>
          <PlusIcon class="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
        </template>
        Créez un quiz
      </Button>
    </div>
    <div class="flex flex-col gap-4 mb-8">
      <Motion
        :initial="{ opacity: 0, y: 40 }"
        :animate="{ opacity: 1, y: 0 }"
        transition="{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }"
      >
        <SearchBarComponent v-model="search" class="mb-4" />
        <div class="flex gap-4 mb-4">
          <Select
            v-model="selectedCategory"
            :options="[{ label: 'Toutes les catégories', value: '' }, ...Object.values(QuizService.categories || {})]"
            placeholder="Catégorie"
           id="category"/>
          <Switch v-model="isPublic" label="Quiz publics uniquement"  id="isPublic"/>
        </div>
      </Motion>
    </div>
    <Motion
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      transition="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }"
    >
      <QuizLoadingSpinner v-if="quizLoadingStore.loading" />
      <!-- Skeleton loading -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mt-5 animate-pulse"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="flex flex-col border-2 border-black rounded-2xl bg-white overflow-hidden aspect-square shadow-[0_4px_0_#000]"
        >
          <div class="flex-1 p-6 rounded-t-2xl flex flex-col gap-3">
            <div class="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="flex gap-2 mt-auto">
              <div class="h-5 w-16 bg-gray-200 rounded-full"></div>
              <div class="h-5 w-20 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div
            class="px-4 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-between items-center"
          >
            <div class="h-5 w-16 bg-gray-200 rounded-full"></div>
            <div class="h-5 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-100 text-red-800 px-4 py-3 rounded-md text-center">
        {{ error }}
      </div>

      <div
        v-else-if="quizzes.length === 0"
        class="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg shadow-inner"
      >
        <div class="text-5xl mb-4">📚</div>
        <h2 class="text-xl font-semibold mb-2">Aucun quiz trouvé</h2>
        <p class="text-gray-600">Créez votre premier quiz pour commencer !</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mt-5">
          <div
            v-for="quiz in quizzes"
            :key="quiz.id"
            @click="goToQuizDetail(quiz.id!)"
            class="cursor-pointer flex flex-col border-2 border-black rounded-2xl bg-white group overflow-hidden relative aspect-square transition-all duration-75 ease-in-out shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-none"
          >
            <div
              class="flex flex-col flex-1 p-6 rounded-t-2xl"
              :style="{
                background: `linear-gradient(135deg, ${getCategoryColor(quiz.category)}, #fff 80%)`,
              }"
            >
              <h3 class="text-2xl font-bold mb-1 truncate">{{ quiz.title }}</h3>
              <p class="text-sm text-gray-700 line-clamp-3 mb-4 flex-grow">
                {{ quiz.description || "Aucune description" }}
              </p>

              <div class="flex flex-wrap items-center gap-2 mt-auto text-xs">
                <span
                  class="px-2 py-1 rounded-full font-semibold shadow"
                  :style="{ backgroundColor: getCategoryColor(quiz.category), color: '#333' }"
                >
                  {{ getCategoryLabel(quiz.category) }}
                </span>

                <div class="flex items-center gap-1 text-gray-600">
                  <FileQuestion class="w-4 h-4" />
                  <span>{{ quiz.questionsNumbers || 0 }} questions</span>
                </div>

                <div class="flex items-center gap-1 text-gray-600">
                  <Calendar class="w-4 h-4" />
                  <span>{{ formatDate(quiz.createdAt) }}</span>
                </div>
              </div>
            </div>

            <div
              class="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100"
            >
              <span
                :class="[
                  'text-xs font-medium px-2 py-1 rounded-full',
                  quiz.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600',
                ]"
              >
                {{ quiz.isPublic ? "Public" : "Privé" }}
              </span>

              <div
                class="text-sm text-primary flex items-center gap-1 font-semibold group-hover:underline group-hover:translate-x-1 transition-all"
              >
                Voir le quiz
                <ArrowRight
                  class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </div>
            <div class="absolute top-0 right-0 m-2">
              <span
                v-if="quiz.status === 'pending'"
                class="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full"
                >En attente</span>
              <span
                v-else-if="quiz.status === 'published'"
                class="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full"
                >Publié</span>
              <span
                v-else-if="quiz.status === 'draft'"
                class="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full"
                >Brouillon</span>
            </div>
          </div>
        </div>
        <!-- Pagination -->
        <div class="flex justify-center mt-8" v-if="totalPages > 1">
          <button
            class="px-3 py-1 mx-1 rounded border border-gray-300 bg-white text-black font-medium"
            :disabled="page === 1"
            @click="page--"
          >
            Précédent
          </button>
          <span class="px-3 py-1 mx-1">Page {{ page }} / {{ totalPages }}</span>
          <button
            class="px-3 py-1 mx-1 rounded border border-gray-300 bg-white text-black font-medium"
            :disabled="page === totalPages"
            @click="page++"
          >
            Suivant
          </button>
        </div>
      </div>
    </Motion>

    <QuizLoadingSpinner
      v-if="quizLoadingStore.isLoading"
      class="fixed bottom-6 right-6 z-50 bg-primary border-2 border-black shadow-[0_4px_0_#000] rounded-lg p-4 flex items-center justify-center"
    />
  </section>
</template>
