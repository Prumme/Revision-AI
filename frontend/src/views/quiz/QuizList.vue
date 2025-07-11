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
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Motion } from "@motionone/vue";
import QuizCard from "@/components/cards/QuizCard.vue";

const router = useRouter();
const userStore = useUserStore();
const quizLoadingStore = useQuizLoadingStore();
const user = userStore.user;

const search = ref("");
const selectedCategory = ref("");
const isPublic = ref<null | boolean>(null);

const quizzes = ref<Quiz[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const quizCount = ref(0);

const quizTabs = computed(() => [
  { key: 'my', label: 'Mes quiz', badge: quizCount.value },
  { key: 'shared', label: 'Quiz de la communauté' },
]);
const activeTab = ref('my');

const page = ref(1);
const limit = ref(8);
const total = ref(0);
const totalPages = ref(1);

function goToQuizDetail(id: string) {
  router.push(`/quiz/${id}`);
}

async function fetchQuizzes() {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const filters: Record<string, unknown> = {};
    if (search.value) filters.search = search.value;
    if (selectedCategory.value) filters.category = selectedCategory.value;
    if (isPublic.value !== null) filters.isPublic = isPublic.value;
    const pagination = { page: page.value, limit: limit.value };
    let res;
    if (activeTab.value === 'shared') {
      res = await QuizService.getAllQuizzes(filters, pagination);
    } else {
      if (!user?.id) {
        quizzes.value = [];
        total.value = 0;
        totalPages.value = 1;
        quizCount.value = 0;
        loading.value = false;
        return;
      }
      res = await QuizService.getUserQuizzes(user.id, filters, pagination);
    }
    if (Array.isArray(res)) {
      quizzes.value = res;
      total.value = res.length;
      totalPages.value = 1;
      if (activeTab.value === 'my') quizCount.value = res.length;
    } else if (res && Array.isArray(res.data)) {
      quizzes.value = res.data;
      total.value = res.total ?? res.data.length ?? 0;
      totalPages.value = res.totalPages ?? 1;
      if (activeTab.value === 'my') quizCount.value = res.total ?? res.data.length ?? 0;
    } else {
      quizzes.value = [];
      total.value = 0;
      totalPages.value = 1;
      if (activeTab.value === 'my') quizCount.value = 0;
    }
  } catch {
    error.value = "Impossible de charger les quiz. Veuillez réessayer plus tard.";
  } finally {
    loading.value = false;
  }
}

watch([search, selectedCategory, isPublic, page, limit, activeTab], async () => {
  await fetchQuizzes();
});

watch(
  () => quizLoadingStore.status,
  (newStatus) => {
    if (newStatus === "completed") {
      fetchQuizzes();
    } else if (newStatus === "error") {
      error.value = "Une erreur est survenue lors du chargement des quiz.";
    }
  },
);

watch(quizCount, (newCount) => {
  quizTabs.value[0].badge = newCount;
});

onMounted(async () => {
  await fetchQuizzes();
});
</script>

<template>
  <section class="flex flex-col gap-1.5 w-full">
    <p class="font-outfit text-lg text-black-transparent">Tous vos quiz</p>
    <h1 class="font-outfit text-4xl font-extrabold text-black">Liste des quiz</h1>

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
        :transition="{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }"
      >
        <SearchBarComponent v-model="search" class="mb-4" />
        <div class="flex gap-4 mb-4">
          <Select
            v-model="selectedCategory"
            :options="[
              { label: 'Toutes les catégories', value: '' },
              ...Object.values(QuizService.categories || {}),
            ]"
            placeholder="Catégorie"
            id="category"
          />
          <Switch v-model="isPublic" label="Quiz privés uniquement" id="isPublic" />
        </div>
      </Motion>
    </div>

    <Motion
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }"
    >
      <!-- Spinner -->
      <QuizLoadingSpinner v-if="quizLoadingStore.isLoading" />

      <!-- Loading Skeleton -->
      <div
        v-else-if="loading"
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

      <!-- Onglets -->
      <TabNavigation
        v-else
        :tabs="quizTabs"
        v-model:activeTab="activeTab"
        class="mb-6"
      />

      <!-- Message d'erreur -->
      <div v-if="error" class="bg-red-100 text-red-800 px-4 py-3 rounded-md text-center">
        {{ error }}
      </div>

      <!-- Aucune donnée -->
      <div
        v-else-if="quizzes.length === 0"
        class="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg shadow-inner"
      >
        <div class="text-5xl mb-4">📚</div>
        <h2 class="text-xl font-semibold mb-2">Aucun quiz trouvé</h2>
        <p class="text-gray-600">Créez votre premier quiz pour commencer !</p>
      </div>

      <!-- Liste des quiz -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          <div
            v-for="quiz in quizzes"
            :key="quiz.id"
            @click="goToQuizDetail(quiz.id!)"
            class="cursor-pointer h-full"
          >
            <QuizCard :category="quiz.category" :date="quiz.createdAt" :questionsCount="quiz.questionsNumbers">
              <template #title>
                <span class="text-2xl font-bold mb-1 truncate">{{ quiz.title }}</span>
              </template>
              <template #description>
                <span class="text-sm text-gray-700 line-clamp-3 mb-4 flex-grow">
                  {{ quiz.description || 'Aucune description' }}
                </span>
              </template>
              <template #meta="{ getCategoryLabel, formatDate }">
                <span class="px-3 py-1 rounded-full font-bold shadow text-base bg-white/80 border border-black/10 text-gray-900 whitespace-nowrap">
                  {{ getCategoryLabel(quiz.category) }}
                </span>
                <span class="flex items-center gap-1 text-gray-600">
                  <FileQuestion class="w-4 h-4" />
                  <span>{{ quiz.questionsNumbers || 0 }} questions</span>
                </span>
                <span class="flex items-center gap-1 text-gray-600">
                  <Calendar class="w-4 h-4" />
                  <span>{{ formatDate(quiz.createdAt) }}</span>
                </span>
              </template>
              <template #status>
                <span :class="['text-xs font-medium px-2 py-1 rounded-full', quiz.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600']">
                  {{ quiz.isPublic ? 'Public' : 'Privé' }}
                </span>
              </template>
              <template #action>
                <span class="text-sm text-primary flex items-center gap-1 font-semibold group-hover:underline group-hover:translate-x-1 transition-all">
                  Voir le quiz
                  <ArrowRight class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </template>
              <template #badge>
                <span v-if="quiz.status === 'pending'" class="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">En attente</span>
                <span v-else-if="quiz.status === 'published'" class="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">Publié</span>
                <span v-else-if="quiz.status === 'draft'" class="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">Brouillon</span>
              </template>
            </QuizCard>
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
  </section>
</template>
