import { ref, computed, onMounted, watch, h } from "vue";
import { QuizService } from "@/services/quiz.service";
import { useToastStore } from "@/stores/toast";
import { useSessionStore } from "@/stores/session";
import { useUserStore } from "@/stores/user";
import { sessionService } from "@/services/session.service";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { TableAction, TableColumn, TableFilter, TableSort, PaginationData, TableFilters } from "@/types/datatable";

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

  // Session table state for backend-driven filtering/sorting/pagination
  const sessionTableFilters = ref<TableFilters>({ status: 'all' });
  const sessionTableSort = ref<TableSort | null>(null);
  const sessionTablePagination = ref<PaginationData>({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const sessionTableLoading = ref(false);

  const showAllSessions = ref(false);
  const allQuizSessions = ref<[]>([]);
  const totalUniqueParticipants = computed(() => {
    if (!showAllSessions.value) return 0;
    const sessions = allQuizSessions.value as Array<{ userId: string }>;
    const uniqueUserIds = new Set(sessions.map(s => s.userId));
    return uniqueUserIds.size;
  });

  const isQuizOwner = computed(() => {
    return quiz.value && quiz.value.userId === userId.value;
  });

  const quizTabs = computed(() => {
    const tabs = [
      { key: "quiz", label: "Quiz" },
      { key: "sessions", label: "Sessions", badge: filteredSessions.value.length > 0 ? filteredSessions.value.length.toString() : undefined },
    ];
    if (quiz.value && quiz.value.userId === userId.value) {
      tabs.push({ key: "config", label: "Configuration" });
    }
    return tabs;
  });

  const sessionColumns: TableColumn[]= [
    {
      key: "startedAt",
      label: "Date de début",
      sortable: true,
      formatter: (value: string) => value ? new Date(value).toLocaleString("fr-FR") : "-",
    },
    {
      key: "finishedAt",
      label: "Date de fin",
      sortable: true,
      formatter: (value: string) => value ? new Date(value).toLocaleString("fr-FR") : "-",
    },
    {
      key: "status",
      label: "Statut",
      sortable: true,
      render: (value: string) => {
        if (value === 'paused') return h(StatusBadge, { variant: 'warning' }, () => 'En pause');
        if (value === 'active') return h(StatusBadge, { variant: 'secondary' }, () => 'En cours');
        if (value === 'finished') return h(StatusBadge, { variant: 'success' }, () => 'Terminée');
        if (value === 'pending') return h(StatusBadge, { variant: 'info' }, () => 'En attente');
        return h(StatusBadge, { variant: 'secondary' }, () => '-');
      },
    },
    {
      key: "score",
      label: "Score",
      sortable: true,
    },
  ];

  const actions: TableAction[] = [
    {
      label: "Reprendre",
      icon: "Play",
      tooltip: "Reprendre cette session",
      variant: "yellow",
      visible: (row) => row.status === "paused",
      handler: async (row) => {
        if (row && row.id) {
          await sessionStore.resumeSession(row.id);
          await fetchAllUserSessions();
          toast.showToast("success", "Session reprise avec succès.");
          activeTab.value = "quiz";
          isStarted.value = true;
          sessionStore.sessionId = row.id;
        }
      },
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
      // Fetch sessions dès le chargement de la page
      await fetchAllUserSessions();
    } catch {
      error.value = "Erreur lors du chargement du quiz.";
    } finally {
      loading.value = false;
    }
  });

  const saveOrder = async () => {
    if (!quiz.value) return;
    try {
      const questions = quiz.value.questions.map(q => ({
        ...q,
        answers: q.answers.map(a => ({ ...a }))
      }));
      await QuizService.updateQuiz(quiz.value.id, { questions });
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
      await new Promise(resolve => setTimeout(resolve, 0));
      await new Promise(resolve => setTimeout(resolve, 1200));
      const session = await sessionStore.startSession(quiz.value.id, userId.value);
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
      const correctIndexes = q.answers.map((a, i) => a.c ? i : -1).filter(i => i !== -1);
      const isCorrect =
        correctIndexes.length === selected.length &&
        correctIndexes.every(i => selected.includes(i));
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
          const correctIndexes = q.answers.map((a, i) => a.c ? i : -1).filter(i => i !== -1);
          const isCorrect = correctIndexes.length === selected.length && correctIndexes.every(i => selected.includes(i));
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
      await sessionStore.endSession(score, buildSessionAnswers());
      userSessions.value.find(s => s.id === sessionStore.sessionId);
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

  // Ajout pour la datatable sessions
  const filteredSessions = ref<Session[]>([]);
  const lastSessionsResponse = ref<{ data: Session[]; total: number; totalPages: number; page: number; limit: number } | null>(null);

  async function fetchAllUserSessions() {
    sessionTableLoading.value = true;
    try {
      // Reset page to 1 si un filtre change (hors pagination)
      if (fetchAllUserSessions._filterChanged) {
        sessionTablePagination.value.currentPage = 1;
        fetchAllUserSessions._filterChanged = false;
      }
      const response = await sessionService.findAllByUserId(userId.value, {
        page: sessionTablePagination.value.currentPage,
        limit: sessionTablePagination.value.itemsPerPage,
        status: sessionTableFilters.value.status !== 'all' ? sessionTableFilters.value.status : undefined,
        scoreMin: sessionTableFilters.value.scoreMin !== undefined ? sessionTableFilters.value.scoreMin : undefined,
        scoreMax: sessionTableFilters.value.scoreMax !== undefined ? sessionTableFilters.value.scoreMax : undefined,
      });
      filteredSessions.value = response.data;
      lastSessionsResponse.value = response;
      sessionTablePagination.value.totalItems = response.total;
      sessionTablePagination.value.totalPages = response.totalPages;
    } catch {
      filteredSessions.value = [];
      lastSessionsResponse.value = null;
    } finally {
      sessionTableLoading.value = false;
    }
  }

  // Rafraîchir les sessions quand les filtres changent
  watch(sessionTableFilters, () => {
    fetchAllUserSessions._filterChanged = true;
    fetchAllUserSessions();
  }, { deep: true });
  watch(() => sessionTablePagination.value.currentPage, fetchAllUserSessions);
  watch(() => sessionTablePagination.value.itemsPerPage, fetchAllUserSessions);

  // Appel initial lors du montage ou changement d'onglet
  onMounted(fetchAllUserSessions);
  watch([activeTab, userId], ([tab]) => {
    if (tab === 'sessions') fetchAllUserSessions();
  });

  // Fetch toutes les sessions du quiz (pour owner)
  async function fetchAllQuizSessions() {
    if (!quiz.value) return;
    sessionTableLoading.value = true;
    try {
      // On suppose que sessionService.findAllByQuizId existe côté backend
      const allSessions = await sessionService.findAllByQuizId(quiz.value.id);
      allQuizSessions.value = allSessions;
    } catch {
      allQuizSessions.value = [];
    } finally {
      sessionTableLoading.value = false;
    }
  }

  // Filtering logic (client-side)
  // const filteredSessions = computed(() => {
  //   if (showAllSessions.value && isQuizOwner.value) {
  //     return getFilteredSessions(allQuizSessions.value);
  //   }
  //   return getFilteredSessions(userSessions.value);
  // });
  // function getFilteredSessions(sessions: Array<{ status: string; score?: number }>) {
  //   let result = sessions;
  //   const { status, scoreMin, scoreMax } = sessionTableFilters.value;
  //   if (status && status !== 'all') {
  //     result = result.filter((s) => s.status === status);
  //   }
  //   if (scoreMin != null) {
  //     result = result.filter((s) => typeof s.score === 'number' ? s.score >= scoreMin : true);
  //   }
  //   if (scoreMax != null && scoreMax > 0) {
  //     result = result.filter((s) => typeof s.score === 'number' ? s.score <= scoreMax : true);
  //   }
  //   return result;
  // }

  // Handlers for SessionDatatable (client-side filtering)
  function handleSessionTableFilters(filters: TableFilters) {
    sessionTableFilters.value = { ...sessionTableFilters.value, ...filters };
  }
  function handleSessionTableSort(sort: TableSort | null) {
    sessionTableSort.value = sort;
  }
  function handleSessionTablePage(page: number) {
    sessionTablePagination.value.currentPage = page;
  }
  function handleSessionTableItemsPerPage(items: number) {
    sessionTablePagination.value.itemsPerPage = items;
    sessionTablePagination.value.currentPage = 1;
  }

  // Fetch all user sessions on tab change
  watch([activeTab, quiz, showAllSessions], async ([tab]) => {
    if (tab === "sessions") {
      if (showAllSessions.value && isQuizOwner.value) {
        await fetchAllQuizSessions();
      } else {
        await fetchAllUserSessions();
      }
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

  const sessionFilters: TableFilter[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "all", label: "Tous" },
        { value: "active", label: "En cours" },
        { value: "paused", label: "En pause" },
        { value: "finished", label: "Terminée" },
        { value: "pending", label: "En attente" },
      ],
      defaultValue: "all",
    },
    {
      key: "scoreMin",
      label: "Score min.",
      type: "number",
      defaultValue: 0,
    },
    {
      key: "scoreMax",
      label: "Score max.",
      type: "number",
      defaultValue: 100,
    },
  ];

  return {
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
    sessionColumns,
    actions,
    onQuestionsOrderChange,
    toggleAllAnswers,
    saveOrder,
    startQuizSession,
    nextStep,
    finishQuiz,
    endSession,
    shuffleQuestions,
    sessionFilters,
    sessionTableFilters,
    sessionTableSort,
    sessionTablePagination,
    sessionTableLoading,
    fetchAllUserSessions,
    fetchAllQuizSessions,
    handleSessionTableFilters,
    handleSessionTableSort,
    handleSessionTablePage,
    handleSessionTableItemsPerPage,
    filteredSessions,
    showAllSessions,
    totalUniqueParticipants,
  };
}
