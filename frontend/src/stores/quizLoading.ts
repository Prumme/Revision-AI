import { QuizService } from "@/services/quiz.service";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToastStore } from "./toast";

enum QuizGenerationJobStatus {
  PENDING = "pending",
  PARSING_FILES = "parsing_files",
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
}

export const useQuizLoadingStore = defineStore("quizLoading", () => {
  const isLoading = ref(false);
  const fileParsingProgress = ref(0);
  const status = ref<QuizGenerationJobStatus | null>(QuizGenerationJobStatus.PENDING);
  function startPolling(quizId: string) {
    fileParsingProgress.value = 0;
    status.value = QuizGenerationJobStatus.PENDING;
    isLoading.value = true;

    QuizService.getQuizStatusJob(quizId, (data, close) => {
      console.log(`Quiz status updated: ${status.value} -> ${data.status}`);
      status.value = Object.values(QuizGenerationJobStatus).includes(
        data.status as QuizGenerationJobStatus,
      )
        ? (data.status as QuizGenerationJobStatus)
        : QuizGenerationJobStatus.PENDING;
      fileParsingProgress.value = data.parsingFileProgress;
      isLoading.value = !(
        data.status === QuizGenerationJobStatus.COMPLETED ||
        data.status === QuizGenerationJobStatus.FAILED
      );
      if (!isLoading.value) {
        useToastStore().showToast(
          data.status === QuizGenerationJobStatus.COMPLETED ? "success" : "error",
          data.status === QuizGenerationJobStatus.COMPLETED
            ? "Votre quiz a été généré avec succès!"
            : "La génération de votre quiz a échoué. Veuillez réessayer.",
        );
        return close();
      }
    }).then();
  }

  const message = computed(() => {
    switch (status.value) {
      case QuizGenerationJobStatus.PENDING:
        return "Génération de votre quiz...";
      case QuizGenerationJobStatus.PARSING_FILES:
        return `Analyse des fichiers en cours... ${Math.round(fileParsingProgress.value * 100)}%`;
      case QuizGenerationJobStatus.GENERATING:
        return "Génération des questions en cours...";
      case QuizGenerationJobStatus.COMPLETED:
        return "Votre quiz est prêt!";
      case QuizGenerationJobStatus.FAILED:
        return "La génération a échoué. Veuillez réessayer.";
      default:
        return "La génération de votre quiz est en cours...";
    }
  });

  return {
    isLoading,
    fileParsingProgress,
    status,
    message,
    startPolling,
  };
});
