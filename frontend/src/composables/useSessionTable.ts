import { useUserStore } from "@/stores/user.ts";
import { sessionService } from "@/services/session.service.ts";
import type { PaginatedResponse } from "@/types/pagination.ts";
import type { Session } from "node:sqlite";
import { computed, onMounted, ref } from "vue";
import type { PaginationData } from "@/components/ui/PaginatorComponent.vue";

export interface QuizAndAuthorIdentifier {
  id: string; // Quiz ID
  authorId: string; // Author/User ID
}

export interface SessionFilters {
  scoreMax: string;
  scoreMin: string;
  status: string; // e.g., "all", "completed", "in-progress"
}
export function useSessionTable(quizAndAuthorIdentifier: QuizAndAuthorIdentifier) {
  const userStore = useUserStore();
  const user = userStore.user;

  const sessions = ref<PaginatedResponse<Session>>({
    data: [],
    total: 0,
    totalPages: 0,
    limit: 10,
    page: 1,
  });

  const filtersValue = ref<SessionFilters>({
    scoreMax: "",
    scoreMin: "",
    status: "all",
  });

  const pagination = computed<PaginationData>(() => {
    return {
      currentPage: sessions.value.page || 1,
      totalPages: sessions.value.totalPages || 1,
      totalItems: sessions.value.total || 0,
      itemsPerPage: sessions.value.limit || 10,
    };
  });

  async function fetchSessions() {
    if (!user) return;
    let sessionPaginatedResponse: PaginatedResponse<Session>;
    if (user.id == quizAndAuthorIdentifier.authorId) {
      //fetch all the sessions for the quiz
      sessionPaginatedResponse = await sessionService.findAllByQuizId(quizAndAuthorIdentifier.id, {
        page: pagination.value.currentPage,
        limit: pagination.value.itemsPerPage,
        ...filtersValue.value,
      });
    } else {
      //fetch only the sessions for the user
      sessionPaginatedResponse = await sessionService.findAllByQuizIdAndUserId(
        quizAndAuthorIdentifier.id,
        user.id,
        {
          page: pagination.value.currentPage,
          limit: pagination.value.itemsPerPage,
          ...filtersValue.value,
        },
      );
    }

    sessions.value = sessionPaginatedResponse;
  }

  function handlePageChange(page: number) {
    sessions.value.page = page;
    fetchSessions().then();
  }

  function handleItemsPerPageChange(n: number) {
    sessions.value.limit = n;
    sessions.value.page = 1; // Reset to first page when items per page changes
    fetchSessions().then();
  }

  function handleFilterChange(filters: unknown): void {
    filtersValue.value = filters as SessionFilters;
    fetchSessions().then();
  }

  onMounted(fetchSessions);

  return {
    handlePageChange,
    handleFilterChange,
    fetchSessions,
    sessions,
    handleItemsPerPageChange,
    pagination,
  };
}
