<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import QuestionDraggable from "@/components/draggables/QuestionDraggable.vue";
import Dropzone from "@/components/dropzone/DropzoneComponent.vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import FormHeader from "@/components/forms/FormHeader.vue";
import Input from "@/components/inputs/InputComponent.vue";
import Select from "@/components/inputs/SelectComponent.vue";
import Switch from "@/components/inputs/SwitchComponent.vue";
import QuizLoadingSpinner from "@/components/loaders/QuizLoadingSpinner.vue";
import { QuizService } from "@/services/quiz.service";
import { useQuizLoadingStore } from "@/stores/quizLoading";
import { useToastStore } from "@/stores/toast";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { ApiError } from "@/types/apiError";

// Router pour la redirection après création
const router = useRouter();
const toast = useToastStore();
const quizLoadingStore = useQuizLoadingStore();

// Quiz Data
const formTitle = ref("Titre du quiz"); // Titre par défaut
const category = ref(""); // Valeur par défaut pour la catégorie
const questionsNumbers = ref(5);
const description = ref("");
const isPublic = ref(false);
const media = ref<File[] | null>(null);
const isLoading = ref(false);

const generatedQuestions = ref([]);
const hasQuestions = computed(() => generatedQuestions.value.length > 0);

// Options de catégorie
const categoryOptions = QuizService.categories;

/**
 * Génération et création du quiz
 */
const generateQuiz = async () => {
  // Validation des champs requis
  if (!formTitle.value || formTitle.value === "Titre du quiz") {
    toast.showToast("error", "Veuillez donner un titre à votre quiz");
    return;
  }

  if (!category.value) {
    toast.showToast("error", "Veuillez sélectionner une catégorie");
    return;
  }

  if (!questionsNumbers.value || questionsNumbers.value <= 0) {
    toast.showToast("error", "Le nombre de questions doit être supérieur à 0");
    return;
  }

  try {
    isLoading.value = true;

    // Préparation des données du quiz
    const quizData = {
      title: formTitle.value,
      category: category.value,
      questionsNumbers: questionsNumbers.value,
      description: description.value || undefined,
      isPublic: isPublic.value,
    };


    // Préparation des fichiers
    const files = !Array.isArray(media.value) ? [media.value] : media.value;
    
    try {
      // Appel au service pour créer le quiz
      console.log("Création du quiz avec les données:", quizData, "et les fichiers:", files);
      //@ts-expect-error error
      const createdQuiz = await QuizService.createQuiz(quizData, files);
      console.log("Quiz créé:", createdQuiz);

      // Démarrer le chargement avec l'ID du quiz pour suivre son état
      if (createdQuiz?.id) quizLoadingStore.startPolling(createdQuiz.id);

      toast.showToast("success", "Quiz créé avec succès! Génération des questions en cours...");

      // Redirection vers la liste des quiz où le spinner sera affiché
      router.push(`/quiz`);

      // La redirection vers la page détaillée du quiz se fera automatiquement
      // grâce au mécanisme de polling dans le quizLoadingStore
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.statusCode === 403) {
        toast.showToast("error", apiError.message);
      } else {
        toast.showToast("error", "Une erreur est survenue lors de la création du quiz");
      }
      isLoading.value = false;
    }
    // une fois la génération terminée grâce à l'observateur dans QuizList
  } catch (error) {
    console.error("Erreur lors de la génération du quiz:", error);
    toast.showToast("error", "Une erreur est survenue lors de la création du quiz");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <!-- Quiz generated-->
  <section
    v-if="hasQuestions"
    class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start"
  >
    <!-- Questions -->
    <QuestionDraggable :questions="{ t: category, questions: generatedQuestions }" class="w-full" />

    <!-- Séparateur vertical -->
    <div class="hidden lg:flex justify-center">
      <div class="w-px h-full bg-gray-200"></div>
    </div>

    <!-- Formulaires -->
    <div class="flex flex-col gap-5">
      <!-- Quiz Informations -->
      <FormCard class="w-full">
        <template #title> Informations générales </template>
        <template #content>
          <section class="grid grid-cols-2 gap-2 space-y-5">
            <Select
              id="categorySelect"
              v-model="category"
              label="Catégorie"
              :options="categoryOptions"
              placeholder="Sélectionnez une catégorie"
            />
            <Input
              id="questionsNumbers"
              v-model="questionsNumbers"
              label="Nombres de questions"
              type="number"
              placeholder="Nombre de questions"
              class="col-span-1"
              :min="1"
              :max="20"
            />
          </section>
          <Input
            id="description"
            v-model="description"
            label="Description"
            type="textarea"
            placeholder="Description du quiz"
            class="col-span-1"
          />
          <div class="flex items-center gap-2">
            <Switch
              id="visibility"
              label="Visibilité du quiz"
              placeholder="Titre du quiz"
              description="Un quiz publique est accessible pour les autres quizzers"
              :modelValue="isPublic"
              @update:modelValue="isPublic = $event"
              class="mt-2"
            />
          </div>
        </template>
      </FormCard>

      <!-- Document -->
      <FormCard class="w-full">
        <template #title> Images </template>
        <template #content>
          <Dropzone class="mb-5" :multiple="true" variant="yellow" v-model="media" />
        </template>
      </FormCard>

      <div class="flex justify-center items-center w-fit">
        <Button tracking_event="quiz_create" variant="primary" @click="generateQuiz" :disabled="isLoading">
          {{ isLoading ? "Génération en cours..." : "Générer le quiz" }}
        </Button>
      </div>
    </div>
  </section>

  <!-- Quiz not generated -->
  <section v-else class="flex flex-col gap-5 w-full">
    <FormHeader v-model:title="formTitle" description="Création & Génération du quiz" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- Formulaires -->
      <div class="flex flex-col gap-5">
        <!-- Quizz Informations -->
        <FormCard class="w-full select-none">
          <template #title> Informations générales </template>
          <template #content>
            <section class="grid grid-cols-1 gap-2 mb-5">
              <Input
                id="title"
                disabled
                v-model="formTitle"
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
                v-model="category"
                label="Catégorie"
                :options="categoryOptions"
                placeholder="Sélectionnez une catégorie"
              />
              <Input
                id="questionsNumbers"
                v-model="questionsNumbers"
                label="Nombres de questions"
                type="number"
                placeholder="Nombre de questions"
                class="col-span-1"
                :min="1"
                :max="20"
              />
            </section>
            <Input
              id="description"
              v-model="description"
              label="Description"
              type="textarea"
              placeholder="Description du quiz"
              class="col-span-1"
            />
            <div class="flex items-center gap-2">
              <Switch
                id="visibility"
                label="Visibilité du quiz"
                placeholder="Titre du quiz"
                description="Un quiz publique est accessible pour les autres quizzers"
                v-model="isPublic"
                class="mt-2"
              />
            </div>
          </template>
        </FormCard>

        <!-- Document -->
        <FormCard class="w-full">
          <template #title> Médias </template>
          <template #content>
            <Dropzone class="mb-5" :multiple="true" variant="yellow" v-model="media" />
          </template>
        </FormCard>
        <div class="flex justify-center items-center w-fit">
          <Button variant="primary" @click="generateQuiz" :disabled="isLoading">
            {{ isLoading ? "Génération en cours..." : "Générer le quiz" }}
          </Button>
        </div>
      </div>

      <!-- Carte d'aide UX utilisateur -->
      <div class="bg-white rounded-2xl border-2 border-primary p-6 mt-5 lg:mt-0">
        <div class="flex items-center mb-4">
          <div class="mr-4">
            <img src="@/assets/caracters/caracterOrange.png" alt="Mascotte IA" class="w-16 h-16 object-contain" />
          </div>
          <div>
            <h3 class="font-encode text-xl font-bold text-black mb-1">
              Prêt à créer ton quiz ?
            </h3>
            <p class="font-outfit text-primary text-sm font-medium">
              RevisionAI va faire le taf pour toi !
            </p>
          </div>
        </div>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-primary rounded-full mr-3"></div>
            <p class="font-outfit text-gray-700 text-sm">
              <span class="font-semibold">Remplis le formulaire</span> avec tes préférences
            </p>
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-primary  rounded-full mr-3"></div>
            <p class="font-outfit text-gray-700 text-sm">
              <span class="font-semibold">Ajoute tes cours</span> pour nous aider à générer des questions pertinentes
            </p>
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-primary  rounded-full mr-3"></div>
            <p class="font-outfit text-gray-700 text-sm">
              <span class="font-semibold">Clique sur "Générer"</span> et laisse l'IA créer ton quiz !
            </p>
          </div>
        </div>
        
        <div class="bg-primary-50 rounded-lg p-4 border border-primary">
          <div class="flex items-center mb-2">
            <svg class="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <h4 class="font-encode font-semibold text-primary text-sm">Petit conseil</h4>
          </div>
          <p class="font-outfit text-primary text-xs">
            Plus tu donnes d'infos (description, images), plus ton quiz sera adapté à tes besoins !
          </p>
        </div>
      </div>
    </div>
  </section>

  <QuizLoadingSpinner
    v-if="quizLoadingStore.isLoading"
    class="fixed bottom-6 right-6 z-50 bg-primary border-2 border-black shadow-[0_4px_0_#000] rounded-lg p-4 flex items-center justify-center"
  />
</template>
