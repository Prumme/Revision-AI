<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import SearchBarComponent from "@/components/inputs/SearchBarComponent.vue";
import Select from "@/components/inputs/SelectComponent.vue";
import Switch from "@/components/inputs/SwitchComponent.vue";
import QuizLoadingSpinner from "@/components/loaders/QuizLoadingSpinner.vue";
import { type Quiz, QuizService, type PaginatedQuizResponse } from "@/services/quiz.service";
import { useQuizLoadingStore } from "@/stores/quizLoading";
import { useUserStore } from "@/stores/user";
import { PlusIcon } from "lucide-vue-next";
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Motion } from "@motionone/vue";
import TabNavigation from "@/components/common/TabNavigation.vue";
import { debounce } from "lodash-es";
import QuizCard from "@/components/cards/QuizCard.vue";
import caracterBlue from "@/assets/caracters/caracterBlue.webp";
import PaginatorComponent from "@/components/ui/PaginatorComponent.vue";

const router = useRouter();
const userStore = useUserStore();
const quizLoadingStore = useQuizLoadingStore();

const user = userStore.user;

const quizzes = ref<Quiz[]>([]);
const quizCount = ref(0);

const quizKeys = {
  my: Symbol("my"),
  shared: Symbol("shared"),
};

const activeTab = ref(quizKeys.my);
const quizTabs = computed(() => [
  { key: quizKeys.my, label: "Mes quiz", badge: quizCount.value },
  { key: quizKeys.shared, label: "Quiz de la communauté" },
]);

const page = ref(1);
const limit = ref(8);
const total = ref(0);
const totalPages = ref(1);

const loading = ref(false);
const error = ref<string | null>(null);
const search = ref("");
const selectedCategory = ref("");
const isPublic = ref<boolean>(false);

const debouncedSearch = ref("");
const updateSearch = debounce((value: string) => {
  debouncedSearch.value = value;
}, 500);

async function fetchQuizzes() {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const filters: Record<string, unknown> = {};
    if (debouncedSearch.value) filters.search = debouncedSearch.value;
    if (selectedCategory.value) filters.category = selectedCategory.value;
    if (isPublic.value) filters.isPublic = isPublic.value;
    const pagination = { page: page.value, limit: limit.value };
    let res: PaginatedQuizResponse;
    if (activeTab.value === quizKeys.shared) {
      res = await QuizService.getAllQuizzes(filters, pagination);
    } else {
      if (!user?.id) {
        throw new Error("User not found");
      }
      res = await QuizService.getUserQuizzes(user.id, filters, pagination);
    }
    quizzes.value = res.data;
    total.value = res.total;
    totalPages.value = res.totalPages;
    if (activeTab.value === quizKeys.my) quizCount.value = res.total;
  } catch {
    error.value = "Impossible de charger les quiz. Veuillez réessayer plus tard.";
  } finally {
    loading.value = false;
  }
}

watch([debouncedSearch, selectedCategory, isPublic, page, limit, activeTab], async () => {
  await fetchQuizzes();
});

watch(
  () => quizLoadingStore.status,
  (newStatus) => {
    if (newStatus === "completed") {
      fetchQuizzes();
    } else if (newStatus === "failed") {
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

watch(search, (value) => {
  updateSearch(value);
});

watch(quizCount, (newCount) => {
  quizTabs.value[0].badge = newCount;
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
            :options="[{ label: 'Toutes les catégories', value: '' }, ...QuizService.categories]"
            placeholder="Catégorie"
            id="category"
          />
          <Switch v-model="isPublic" label="Quiz publics uniquement" id="isPublic" />
        </div>
      </Motion>
    </div>

    <TabNavigation :tabs="quizTabs" v-model:activeTab="activeTab" class="mb-6" />

    <QuizLoadingSpinner
      v-if="quizLoadingStore.isLoading"
      class="fixed bottom-6 right-6 z-50 bg-primary border-2 border-black shadow-[0_4px_0_#000] rounded-lg p-4 flex items-center justify-center"
    />

    <Motion
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }"
    >
      <!-- Loading Skeleton -->
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

      <!-- Error -->
      <div v-else-if="error" class="bg-red-100 text-red-800 px-4 py-3 rounded-md text-center">
        {{ error }}
      </div>

      <!-- Empty -->
      <div
        v-else-if="quizzes.length === 0"
        class="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg shadow-inner"
      >
        <div class="text-5xl mb-4">
          <img :src="caracterBlue" alt="Aucun quiz" class="w-16 h-16 mx-auto" />
        </div>
        <h2 class="text-xl font-semibold mb-2">Aucun quiz trouvé</h2>
        <p class="text-gray-600">Créez votre premier quiz pour commencer !</p>
      </div>

      <!-- Quiz list -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mt-5">
          <QuizCard
            v-for="quiz in quizzes"
            :key="quiz.id"
            :quiz="quiz"
            :show-report-button="true"
            :show-status-badge="true"
            :show-visibility-info="true"
            aspect-ratio="square"
          />
        </div>

        <!-- Pagination -->
        <PaginatorComponent
          :pagination="{
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit,
          }"
          hide-items-per-page
          class="mt-6"
          @update:page="page = $event"
          @update:itemsPerPage="limit = $event"
        />
      </div>
    </Motion>
  </section>
</template>
