<script setup lang="ts">
import QuestionDraggable from "@/components/draggables/QuestionDraggable.vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import Input from "@/components/inputs/InputComponent.vue";
import Switch from "@/components/inputs/SwitchComponent.vue";
import { QuizService } from "@/services/quiz.service";
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import Button from "@/components/buttons/ButtonComponent.vue";
import { useQuizDetails } from '@/composables/useQuizDetails';
import LoaderOverlay from "@/components/common/LoaderOverlay.vue";
import { useSessionStore } from '@/stores/session';
import SessionDatatable from '@/components/tables/SessionDatatable.vue';
import {PauseIcon} from "lucide-vue-next";
import {useToastStore} from "@/stores/toast.ts";
import { ArrowLeftIcon } from "lucide-vue-next";
import TabNavigation from '@/components/common/TabNavigation.vue';
import MotionLayout from "@/components/layouts/MotionLayout.vue";

const toast = useToastStore();
const route = useRoute();
const quizId = route.params.id as string;
const quizDetails = useQuizDetails(quizId);
const sessionStore = useSessionStore();

const {
  quiz,
  loading,
  error,
  orderChanged,
  showAllAnswers,
  activeTab,
  currentStep,
  userAnswers,
  quizFinished,
  quizScore,
  showCorrection,
  isStarted,
  showLoader,
  isQuizOwner,
  quizTabs,
  sessionColumns,
  actions,
  onQuestionsOrderChange,
  toggleAllAnswers,
  saveOrder,
  startQuizSession,
  nextStep,
  endSession,
  shuffleQuestions,
  fetchSessionsForTable,
  sessionTableLoading,
  filteredSessions,
  sessionFilters,
  sessionTableFilters,
  handleSessionTableFilters,
  showAllSessions,
  fetchAllQuizSessions,
  fetchAllUserSessions,
  totalUniqueParticipants,
} = quizDetails;

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

watch([activeTab, quiz], async ([tab]) => {
  if (tab === 'sessions') {
    await fetchSessionsForTable;
  }
});

watch(showAllSessions, async (val) => {
  if (isQuizOwner.value) {
    if (val) {
      await fetchAllQuizSessions();
    } else {
      await fetchAllUserSessions();
    }
  }
});

function handlePauseSession() {
  sessionStore.pauseSession();
  activeTab.value = 'sessions';
  toast.showToast("success", "Session mise en pause. Vous pouvez reprendre plus tard.");
}
</script>

<template>
  <LoaderOverlay v-if="showLoader" message="Création de la session en cours..." />
  <MotionLayout
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
    <TabNavigation
      :tabs="quizTabs"
      v-model:activeTab="activeTab"
      class="mb-6"
    />

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
        <div class="flex gap-4 justify-center items-center">
          <Button class="mt-4" color="danger" @click="endSession">Arrêter la session</Button>
          <Button size="icon" class="mt-4" color="secondary" @click="handlePauseSession">
            <PauseIcon class="w-6 h-6" />
          </Button>
          <Button
            class="mt-4"
            :disabled="!userAnswers[currentStep] || userAnswers[currentStep].length === 0"
            @click="nextStep"
          >
            {{ showCorrection ? (currentStep === quiz.questions.length - 1 ? 'Voir le résultat' : 'Question suivante') : 'Valider' }}
          </Button>
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

    <!-- Sessions -->
    <section v-if="quiz && activeTab === 'sessions'">
      <div class="flex items-center gap-6 mb-4">
        <h2 class="text-2xl font-bold">Vos sessions sur ce quiz</h2>
        <template v-if="isQuizOwner">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
                id="accept-terms"
                v-model="showAllSessions"
                type="checkbox"
                class="w-4 h-4 rounded focus:ring-primary focus:ring-2"
                style="accent-color: var(--color-primary)"
                required
            />
            <span class="text-base">Afficher toutes les sessions du quiz</span>
          </label>
        </template>
      </div>
      <div v-if="isQuizOwner && showAllSessions" class="mb-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-sm font-semibold">
          Compteur total de participations : {{ totalUniqueParticipants }} personne{{ totalUniqueParticipants > 1 ? 's' : '' }} ont fait ce quiz
        </span>
      </div>
      <SessionDatatable
        :data="filteredSessions"
        :actions="actions"
        :columns="sessionColumns"
        :loading="sessionTableLoading"
        :rowKey="'id'"
        :filters="sessionFilters"
        :initial-filters="sessionTableFilters"
        empty-message="Aucune session trouvée pour ce quiz."
        @update:filters="handleSessionTableFilters"
      />
    </section>
  </MotionLayout>
</template>
