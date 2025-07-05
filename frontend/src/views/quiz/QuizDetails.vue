<script setup lang="ts">
import QuestionDraggable from "@/components/draggables/QuestionDraggable.vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import Input from "@/components/inputs/InputComponent.vue";
import Switch from "@/components/inputs/SwitchComponent.vue";
import { Quiz, QuizService } from "@/services/quiz.service";
import { useToastStore } from "@/stores/toast";
import { ArrowLeftIcon } from "lucide-vue-next";
import { onMounted, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import Button from "@/components/buttons/ButtonComponent.vue";
import { Motion } from '@motionone/vue';
import { useSessionStore } from "@/stores/session";
import {useUserStore} from "@/stores/user.ts";
import { sessionService } from "@/services/session.service";
import DataTable from '@/components/tables/DataTable.vue';
import LoaderOverlay from '@/components/common/LoaderOverlay.vue';

const route = useRoute();
const toast = useToastStore();
const sessionStore = useSessionStore();
const quizId = route.params.id as string;
const quiz = ref<Quiz | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const orderChanged = ref(false);
const showAllAnswers = ref(false);
const activeTab = ref("config");

const currentStep = ref(0);
const userAnswers = ref<Record<number, number[]>>({});
const quizFinished = ref(false);
const quizScore = ref(0);
const showCorrection = ref(false);
const isStarted = ref(false);
const showLoader = ref(false);

const user = useUserStore();
const userId = ref<string>(user.user.id);

const isQuizOwner = computed(() => {
  return quiz.value && quiz.value.userId === userId.value;
});

const quizTabs = [
  { key: "quiz", label: "Quiz" },
  { key: 'sessions', label: 'Sessions' },
  { key: "config", label: "Configuration" },
];

const sessionColumns = [
  {
    key: 'startedAt',
    label: 'Date de début',
    sortable: true,
    formatter: (value: string) => value ? new Date(value).toLocaleString('fr-FR') : '-',
  },
  {
    key: 'finishedAt',
    label: 'Date de fin',
    sortable: true,
    formatter: (value: string) => value ? new Date(value).toLocaleString('fr-FR') : '-',
  },
  {
    key: 'score',
    label: 'Score',
    sortable: true,
  },
];

const onQuestionsOrderChange = (newQuestions: Quiz["questions"]) => {
  orderChanged.value = true;
  if (quiz.value) quiz.value.questions = newQuestions;
};

const toggleAllAnswers = () => {
  showAllAnswers.value = !showAllAnswers.value;
};

onMounted(async () => {
  try {
    loading.value = true;
    quiz.value = await QuizService.getQuizById(quizId);
  } catch {
    error.value = "Erreur lors du chargement du quiz.";
  } finally {
    loading.value = false;
  }
});

const saveOrder = async () => {
  if (!quiz.value) return;
  try {
    console.log(quiz.value.questions);
    const questions = quiz.value.questions.map(q => ({
      ...q,
      answers: q.answers.map(a => ({ ...a }))
    }));

    await QuizService.updateQuiz(quiz.value.id, { questions });
    orderChanged.value = false;
    toast.showToast("success", "Ordre des questions sauvegardé !");
  } catch  {
    toast.showToast("error", "Erreur lors de la sauvegarde.");
  }
};

const startQuizSession = async () => {
  if (!quiz.value || !userId.value) return;
  try {
    showLoader.value = true;
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 1200));
    const session = await sessionStore.startSession(quiz.value.id, userId.value);
    if (!session || !session.id) {
      toast.showToast("error", "Erreur lors de la création de la session.");
      return;
    }
    sessionStore.sessionId = session.id;
    isStarted.value = true;
    activeTab.value = "quiz";
  } catch  {
    toast.showToast("error",  "Erreur lors du démarrage de la session.");
  } finally {
    showLoader.value = false;
    loading.value = false;
  }
};

const nextStep = async () => {
  if (!showCorrection.value) {
    const answer = {
      questionIndex: currentStep.value,
      selected: userAnswers.value[currentStep.value] || [],
    };
    if (sessionStore.sessionId) {
      try {
        await sessionService.addAnswer(sessionStore.sessionId, answer);
      } catch  {
        toast.showToast("error", "Erreur lors de l'enregistrement de la réponse.");
      }
    }
    showCorrection.value = true;
    return;
  }
  showCorrection.value = false;
  if (currentStep.value < (quiz.value?.questions.length || 0) - 1) {
    currentStep.value++;
  } else {
    finishQuiz();
  }
};

const finishQuiz = async () => {
  quizFinished.value = true;
  let score = 0;
  quiz.value?.questions.forEach((q, idx) => {
    const correctIndexes = q.answers.map((a, i) => a.c ? i : -1).filter(i => i !== -1);
    const selected = userAnswers.value[idx] || [];
    if (
      correctIndexes.length === selected.length &&
      correctIndexes.every(i => selected.includes(i))
    ) {
      score++;
    }
  });
  quizScore.value = score;
  if (sessionStore.sessionId) {
    await sessionStore.endSession(score, Object.values(userAnswers.value));
  }
};

const endSession = async () => {
  if (!sessionStore.sessionId) return;
  try {
    loading.value = true;
    await sessionStore.endSession(quizScore.value, Object.values(userAnswers.value));
    isStarted.value = false;
    quizFinished.value = false;
    currentStep.value = 0;
    userAnswers.value = {};
    quizScore.value = 0;
    showCorrection.value = false;
    toast.showToast("success", "Session terminée.");
  } catch {
    toast.showToast("error", "Erreur lors de l'arrêt de la session.");
  } finally {
    loading.value = false;
  }
};

const userSessions = ref<Session[]>([]);

const fetchUserSessions = async () => {
  if (!quiz.value || !userId.value) return;
  userSessions.value = await sessionStore.listUserSessions(userId.value);
  userSessions.value = userSessions.value.filter(s => s.quizId === quiz.value?.id);
};

watch([activeTab, quiz], async ([tab]) => {
  if (tab === 'sessions') {
    await fetchUserSessions();
  }
});

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestions() {
  if (quiz.value && quiz.value.questions) {
    quiz.value.questions = shuffleArray(quiz.value.questions);
    orderChanged.value = true;
  }
}
</script>

<template>
  <LoaderOverlay v-if="showLoader" message="Création de la session en cours..." />
  <Motion
    :initial="{ opacity: 0, y: 40 }"
    :animate="{ opacity: 1, y: 0 }"
    transition="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }"
  >
    <div class="flex items-center justify-between mb-8">
      <div class="flex flex-col gap-1.5">
        <p class="font-outfit text-lg text-black-transparent">Commence à réviser</p>
        <h1 class="font-outfit text-4xl font-extrabold text-black">
          Détails du quiz : <span class="text-primary font-semibold">{{ quiz?.title }}</span>
        </h1>
      </div>
      <router-link
        to="/quiz"
        class="text-primary font-semibold text-base group flex items-center transition-all"
      >
        <ArrowLeftIcon
          class="transition-colors w-5 h-5 inline-block mr-1 transform transition-transform group-hover:-translate-x-1 group-hover:text-primary text-black transition-colors"
        />
        <span class="transition-colors text-black group-hover:text-primary">Retour aux quiz</span>
      </router-link>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6">
      <button
        v-for="tab in quizTabs"
        :key="tab.key"
        @click="() => {
          if (tab.key !== 'config' || isQuizOwner) activeTab = tab.key;
        }"
        class="font-outfit px-4 py-2 -mb-px text-lg transition-colors duration-150"
        :class="[
          activeTab === tab.key
            ? 'border-b-2 border-primary text-black font-semibold'
            : 'text-black-transparent hover:text-black',
          tab.key === 'config' && !isQuizOwner ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        style="background: none"
        :disabled="tab.key === 'config' && !isQuizOwner"
      >
        {{ tab.label }}
      </button>
    </div>

    <section v-if="loading" class="text-center py-10 text-lg font-semibold">
      Chargement du quiz...
    </section>
    <section v-else-if="error" class="text-center py-10 text-red-600">{{ error }}</section>

    <!-- Start Quiz  -->
    <section v-if="quiz && activeTab === 'quiz' && !isStarted" class="max-w-2xl mx-auto w-full text-center py-10">
      <h2 class="text-3xl font-extrabold mb-4">Prêt à commencer le quiz ?</h2>
      <p class="text-lg text-black-transparent mb-8">
        Teste tes connaissances sur <span class="text-primary font-semibold">{{ quiz.title }}</span>
      </p>
      <Button
        class="btn btn-primary"
        :disabled="loading"
        @click="startQuizSession"
      >
        {{ loading ? 'Chargement...' : 'Commencer le quiz' }}
      </Button>
    </section>

    <!-- Quiz Configuration -->
    <section v-if="quiz && activeTab === 'config' && isQuizOwner" class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
      <!-- Questions -->
      <div>
        <div class="flex gap-2 mb-4">
          <Button
            @click="toggleAllAnswers"
            type="button"
            v-if="quiz.questions && quiz.questions.length"
          >
            {{ showAllAnswers ? 'Masquer toutes les réponses' : 'Afficher toutes les réponses' }}
          </Button>
          <Button
            @click="shuffleQuestions"
            type="button"
            v-if="quiz.questions && quiz.questions.length"
            color="secondary"
          >
            Mélanger l'ordre
          </Button>
        </div>
        <QuestionDraggable
          v-if="quiz.questions && quiz.questions.length"
          :questions="quiz.questions"
          :showAllAnswers="showAllAnswers"
          class="w-full"
          @update:questions="onQuestionsOrderChange"
          mode="config"
        />
      </div>
      <div class="hidden lg:flex justify-center">
        <div class="w-px h-full bg-gray-200"></div>
      </div>
      <div class="flex flex-col gap-5">
        <!-- Quizz Informations -->
        <FormCard class="w-full select-none">
          <template #title> Informations générales </template>
          <template #content>
            <section class="grid grid-cols-1 gap-2 mb-5">
              <Input
                id="title"
                :disabled="true"
                v-model="quiz.title"
                label="Titre du quiz"
                type="text"
                placeholder="Titre du quiz"
                class="col-span-1"
                :min="1"
                :max="20"
              />
            </section>
            <section class="grid grid-cols-2 gap-2 space-y-5">
              <Input
                id="categorySelect"
                v-model="quiz.category"
                label="Catégorie"
                :options="categoryOptions"
                placeholder="Sélectionnez une catégorie"
                :disabled="true"
              />
              <Input
                id="questionsNumbers"
                v-model="quiz.questionsNumbers"
                label="Nombres de questions"
                type="number"
                placeholder="Nombre de questions"
                class="col-span-1"
                :min="1"
                :max="20"
                :disabled="true"
              />
            </section>
            <Input
              id="description"
              label="Description"
              v-model="quiz.description"
              type="textarea"
              placeholder="Description du quiz"
              class="col-span-1"
              :disabled="true"
            />
            <div class="flex items-center gap-2">
              <Switch
                id="visibility"
                label="Visibilité du quiz"
                placeholder="Titre du quiz"
                description="Un quiz publique est accessible pour les autres quizzers"
                v-model="quiz.isPublic"
                class="mt-2"
                :disabled="true"
              />
            </div>
          </template>
        </FormCard>
        <FormCard class="w-full mt-4" v-if="quiz.media && quiz.media.length">
          <template #title>Fichiers du quiz</template>
          <template #content>
            <ul class="space-y-2">
              <li v-for="(mediaPath, idx) in quiz.media" :key="idx">
                <a
                  :href="`/api/public/${mediaPath}`"
                  target="_blank"
                  class="text-primary underline hover:text-primary-dark transition-colors duration-200 font-semibold text-sm flex items-center gap-2 transition-colors"
                >
                  {{ mediaPath.split('/').pop() }}
                </a>
              </li>
            </ul>
          </template>
        </FormCard>
        <Button
          v-if="orderChanged && quiz.questions && quiz.questions.length"
          @click="saveOrder"
          class="btn btn-primary mt-4"
        >
          Sauvegarder l'ordre des questions
        </Button>
      </div>
    </section>

    <!-- Quiz -->
    <section v-if="quiz && activeTab === 'quiz' && isStarted" class="max-w-2xl mx-auto w-full">
      <div v-if="!quizFinished">
        <div class="mb-6">
          <QuestionDraggable
            :questions="[quiz.questions[currentStep]]"
            :showAllAnswers="quizFinished || showCorrection"
            :userSelection="{0: userAnswers[currentStep] || []}"
            @update:selection="(selection) => userAnswers[currentStep] = selection[0] || []"
            mode="quiz"
          />
        </div>
        <div class="flex gap-4 justify-center">
          <Button
            class="mt-4"
            :disabled="!userAnswers[currentStep] || userAnswers[currentStep].length === 0"
            @click="nextStep"
          >
            {{ showCorrection ? (currentStep === quiz.questions.length - 1 ? 'Voir le résultat' : 'Question suivante') : 'Valider' }}
          </Button>
          <Button class="mt-4" color="danger" @click="endSession">Arrêter la session</Button>
        </div>
      </div>
      <div v-else class="text-center py-10">
        <div class="text-2xl font-bold mb-4">Résultat du quiz</div>
        <div class="text-lg mb-2">Score : {{ quizScore }} / {{ quiz.questions.length }}</div>
        <Button class="mt-4" @click="() => { currentStep = 0; quizFinished = false; userAnswers = {}; quizScore = 0; showCorrection.value = false; isStarted = false; }">
          Recommencer le quiz
        </Button>
      </div>
    </section>

    <!-- Onglet Sessions -->
    <section v-if="quiz && activeTab === 'sessions'">
      <h2 class="text-2xl font-bold mb-4">Vos sessions sur ce quiz</h2>
      <DataTable
        :data="userSessions"
        :columns="sessionColumns"
        :loading="loading"
        :rowKey="'id'"
        :searchable="false"
        empty-message="Aucune session trouvée pour ce quiz."
      />
    </section>

  </Motion>
</template>
