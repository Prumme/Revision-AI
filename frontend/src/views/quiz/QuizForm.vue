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

// Router pour la redirection après création
const router = useRouter();
const toast = useToastStore();
const quizLoadingStore = useQuizLoadingStore();

// Quiz Data
// const formTitle = ref("Titre du quiz");
// const category = ref("");
// const questionsNumbers = ref(5);
// const description = ref("");
// const isPublic = ref(false);
// const media = ref<File | null>(null);
// const isLoading = ref(false);

// create a fake quiz data please
const formTitle = ref("Test Quiz Creation");
const category = ref("general_history");
const questionsNumbers = ref(5);
const description = ref("Description du quiz");
const isPublic = ref(false);
const media = ref<File | null>(null);
const isLoading = ref(false);

const generatedQuestions = ref([]);
const hasQuestions = computed(() => generatedQuestions.value.length > 0);

// Options de catégorie
const categoryOptions = [
  { label: "Histoire générale", value: "general_history" },
  { label: "Géographie", value: "geography" },
  { label: "Sciences", value: "sciences" },
  { label: "Mathématiques", value: "mathematics" },
  { label: "Littérature", value: "literature" },
];

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
      status: "pending", // Définir le statut initial comme 'pending'
    };

    console.log("Données du quiz à envoyer:", quizData);

    // Préparation des fichiers
    const files = media.value ? [media.value] : [];
    try {
      // Appel au service pour créer le quiz
      const createdQuiz = await QuizService.createQuiz(quizData, files);
      console.log("Quiz créé:", createdQuiz);

      // Démarrer le chargement avec l'ID du quiz pour suivre son état
      quizLoadingStore.startLoading(createdQuiz.id);

      toast.showToast("success", "Quiz créé avec succès! Génération des questions en cours...");

      // Redirection vers la liste des quiz où le spinner sera affiché
      router.push(`/quiz`);

      // La redirection vers la page détaillée du quiz se fera automatiquement
      // grâce au mécanisme de polling dans le quizLoadingStore
    } catch (error) {
      console.error("Erreur lors de la création du quiz:", error);
      toast.showToast("error", "Une erreur est survenue lors de la création du quiz");
      isLoading.value = false;
    }
    // une fois la génération terminée grâce à l'observateur dans QuizList
  } catch (error) {
    console.error("Erreur lors de la génération du quiz:", error);
    toast.showToast("error", "Une erreur est survenue lors de la création du quiz");
    quizLoadingStore.stopLoading(); // Arrêter le spinner en cas d'erreur
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
          <Dropzone class="mb-5" :multiple="false" variant="yellow" v-model="media" />
        </template>
      </FormCard>

      <div class="flex justify-center items-center w-fit">
        <Button variant="primary" @click="generateQuiz" :disabled="isLoading">
          {{ isLoading ? "Génération en cours..." : "Générer le quiz" }}
        </Button>
      </div>
    </div>
  </section>

  <!-- Quiz not generated -->
  <section v-else class="flex flex-col gap-5 w-full">
    <FormHeader v-model:title="formTitle" description="Création & Génération du quiz" />

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
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
            <Dropzone class="mb-5" :multiple="false" variant="yellow" v-model="media" />
          </template>
        </FormCard>

        <div class="flex justify-center items-center w-fit">
          <Button variant="primary" @click="generateQuiz" :disabled="isLoading">
            {{ isLoading ? "Génération en cours..." : "Générer le quiz" }}
          </Button>
        </div>
      </div>
    </div>
  </section>

  <QuizLoadingSpinner
    v-if="quizLoadingStore.isLoading"
    class="fixed bottom-6 right-6 z-50 bg-primary border-2 border-black shadow-[0_4px_0_#000] rounded-lg p-4 flex items-center justify-center"
  />
</template>
