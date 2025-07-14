import { ref, computed } from "vue";
import { QuizService, type Quiz } from "@/services/quiz.service";
import { useToastStore } from "@/stores/toast";
import { useSessionStore } from "@/stores/session";
import { useUserStore } from "@/stores/user";
import { sessionService } from "@/services/session.service";

export function useQuizDetails(quizId: string) {
  const toast = useToastStore();
  const sessionStore = useSessionStore();
  const user = useUserStore();
  const userId = ref<string>(user.user.id);

  const quiz = ref<Quiz | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const orderChanged = ref(false);
  const showAllAnswers = ref(false);
  const activeTab = ref<string>("quiz");
  const userAnswers = ref<Record<number, number[]>>({});
  const quizFinished = ref(false);
  const quizScore = ref(0);
  const showCorrection = ref(false);
  const isStarted = ref(false);
  const showLoader = ref(false);
  const currentStep = ref(0);
  const userSessions = ref<[]>([]);

  const sessionCount = ref(0);
  function setSessionCount(count: number) {
    sessionCount.value = count;
  }
  const sessionTableLoading = ref(false);

  const showAllSessions = ref(false);
  const allQuizSessions = ref<[]>([]);
  const totalUniqueParticipants = computed(() => {
    if (!showAllSessions.value) return 0;
    const sessions = allQuizSessions.value as Array<{ userId: string }>;
    const uniqueUserIds = new Set(sessions.map((s) => s.userId));
    return uniqueUserIds.size;
  });

  const isQuizOwner = computed(() => {
    return quiz.value && quiz.value.userId === userId.value;
  });

  const quizTabs = computed(() => {
    const tabs = [
      { key: "quiz", label: "Quiz" },
      {
        key: "sessions",
        label: "Sessions",
        badge: sessionCount.value !== 0 ? sessionCount.value : undefined,
      },
    ];
    if ((quiz.value && quiz.value.userId === userId.value) || user.isAdmin) {
      tabs.push({ key: "config", label: "Configuration" });
    }
    return tabs;
  });

  const onQuestionsOrderChange = (newQuestions: Quiz["questions"]) => {
    orderChanged.value = true;
    if (quiz.value) quiz.value.questions = newQuestions;
  };

  const toggleAllAnswers = () => {
    showAllAnswers.value = !showAllAnswers.value;
  };

  const saveQuiz = async () => {
    if (quiz.value === null) return;
    try {
      const questions = quiz.value.questions.map((q) => ({
        ...q,
        answers: q.answers.map((a) => ({ ...a })),
      }));
      await QuizService.updateQuiz(quizId, {
        questions,
        title: quiz.value.title,
        description: quiz.value.description,
        category: quiz.value.category,
        questionsNumbers: quiz.value.questionsNumbers,
        isPublic: quiz.value.isPublic,
      });
      orderChanged.value = false;
      toast.showToast("success", "Ordre des questions sauvegardé !");
    } catch {
      toast.showToast("error", "Erreur lors de la sauvegarde.");
    }
  };

  const startQuizSession = async () => {
    if (!quiz.value || !userId.value) return;
    try {
      showLoader.value = true;
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const session = await sessionStore.startSession(quizId, userId.value);
      if (!session || !session.id) {
        toast.showToast("error", "Erreur lors de la création de la session.");
        return;
      }
      sessionStore.sessionId = session.id;
      isStarted.value = true;
      activeTab.value = "quiz";
    } catch {
      toast.showToast("error", "Erreur lors du démarrage de la session.");
    } finally {
      showLoader.value = false;
      loading.value = false;
    }
  };

  function buildSessionAnswers(): { a: string; c: boolean }[] {
    if (!quiz.value) return [];
    return quiz.value.questions.map((q, idx) => {
      const selected = userAnswers.value[idx] || [];
      const correctIndexes = q.answers.map((a, i) => (a.c ? i : -1)).filter((i) => i !== -1);
      const isCorrect =
        correctIndexes.length === selected.length &&
        correctIndexes.every((i) => selected.includes(i));
      return {
        a: q.id || q._id || idx.toString(),
        c: isCorrect,
      };
    });
  }

  const nextStep = async () => {
    if (!showCorrection.value) {
      if (sessionStore.sessionId) {
        try {
          const q = quiz.value?.questions[currentStep.value];
          const selected = userAnswers.value[currentStep.value] || [];
          const correctIndexes = q.answers.map((a, i) => (a.c ? i : -1)).filter((i) => i !== -1);
          const isCorrect =
            correctIndexes.length === selected.length &&
            correctIndexes.every((i) => selected.includes(i));
          await sessionService.addAnswer(sessionStore.sessionId, {
            a: q.id || q._id || currentStep.value.toString(),
            c: isCorrect,
          });
        } catch {
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
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    quizFinished.value = true;
    let score = 0;
    quiz.value?.questions.forEach((q, idx) => {
      const correctIndexes = q.answers.map((a, i) => (a.c ? i : -1)).filter((i) => i !== -1);
      const selected = userAnswers.value[idx] || [];
      if (
        correctIndexes.length === selected.length &&
        correctIndexes.every((i) => selected.includes(i))
      ) {
        score++;
      }
    });
    quizScore.value = score;
    if (sessionStore.sessionId) {
      await sessionStore.endSession(score, buildSessionAnswers());
      userSessions.value.find((s) => s.id === sessionStore.sessionId);
    }
  };

  const endSession = async () => {
    if (!sessionStore.sessionId) return;
    try {
      loading.value = true;
      console.log("ici", userAnswers.value);
      await sessionStore.endSession(quizScore.value, buildSessionAnswers());
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

  return {
    setSessionCount,
    quiz,
    loading,
    error,
    orderChanged,
    showAllAnswers,
    activeTab,
    userAnswers,
    quizFinished,
    quizScore,
    showCorrection,
    isStarted,
    showLoader,
    currentStep,
    userSessions,
    isQuizOwner,
    quizTabs,
    onQuestionsOrderChange,
    toggleAllAnswers,
    saveQuiz,
    startQuizSession,
    nextStep,
    finishQuiz,
    endSession,
    shuffleQuestions,
    sessionTableLoading,
    showAllSessions,
    totalUniqueParticipants,
  };
}
