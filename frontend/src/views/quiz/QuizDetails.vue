<script setup lang="ts">
import QuestionDraggable from "@/components/draggables/QuestionDraggable.vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import Input from "@/components/inputs/InputComponent.vue";
import Select from "@/components/inputs/SelectComponent.vue";
import Switch from "@/components/inputs/SwitchComponent.vue";
import { Quiz, QuizService } from "@/services/quiz.service";
import { useToastStore } from "@/stores/toast";
import { ArrowLeftIcon } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Button from "@/components/buttons/ButtonComponent.vue";
import { Motion } from '@motionone/vue';

const route = useRoute();
const toast = useToastStore();
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

// Animation state for confetti
const showConfetti = ref(false);

const quizTabs = [
  { key: "quiz", label: "Quiz" },
  { key: "config", label: "Configuration" },
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
  } catch (e) {
    error.value = (e instanceof Error ? e.message : String(e)) || "Erreur lors du chargement du quiz.";
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
  } catch (e) {
    toast.showToast("error", (e instanceof Error ? e.message : String(e)) || "Erreur lors de la sauvegarde.");
  }
};

const nextStep = () => {
  if (!showCorrection.value) {
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

const finishQuiz = () => {
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
  setTimeout(() => showConfetti.value = false, 3000);
};
</script>

<template>
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
        @click="activeTab = tab.key"
        class="font-outfit px-4 py-2 -mb-px text-lg transition-colors duration-150"
        :class="[
        activeTab === tab.key
          ? 'border-b-2 border-primary text-black font-semibold'
          : 'text-black-transparent hover:text-black',
      ]"
        style="background: none"
      >
        {{ tab.label }}
      </button>
    </div>

    <section v-if="loading" class="text-center py-10 text-lg font-semibold">
      Chargement du quiz...
    </section>
    <section v-else-if="error" class="text-center py-10 text-red-600">{{ error }}</section>

    <!-- Quiz Configuration -->
    <section v-if="quiz && activeTab === 'config'" class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
      <!-- Questions -->
      <div>
        <Button
          class="mb-4"
          @click="toggleAllAnswers"
          type="button"
          v-if="quiz.questions && quiz.questions.length"
        >
          {{ showAllAnswers ? 'Masquer toutes les réponses' : 'Afficher toutes les réponses' }}
        </Button>
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
              <Select
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
    <section v-if="quiz && activeTab === 'quiz'" class="max-w-2xl mx-auto w-full">
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
        <Button
          class="mt-4"
          :disabled="!userAnswers[currentStep] || userAnswers[currentStep].length === 0"
          @click="nextStep"
        >
          {{ showCorrection ? (currentStep === quiz.questions.length - 1 ? 'Voir le résultat' : 'Question suivante') : 'Valider' }}
        </Button>
      </div>
      <div v-else class="text-center py-10">
        <div class="text-2xl font-bold mb-4">Résultat du quiz</div>
        <div class="text-lg mb-2">Score : {{ quizScore }} / {{ quiz.questions.length }}</div>
        <Button class="mt-4" @click="() => { currentStep = 0; quizFinished = false; userAnswers = {}; quizScore = 0; showCorrection.value = false; }">
          Recommencer le quiz
        </Button>
      </div>
    </section>
  </Motion>
</template>
