<script setup lang="ts">
// import { ref, computed } from "vue";
// import DataTable from "./DataTable.vue";
import type { TableAction, TableColumn, TableFilter } from "@/types/datatable";
import { type QuizAndAuthorIdentifier, useSessionTable } from "@/composables/useSessionTable.ts";
import DataTable from "@/components/tables/DataTable.vue";
import { h, watch } from "vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import { useSessionStore } from "@/stores/session.ts";
import { useToastStore } from "@/stores/toast.ts";

// interface SessionDatatableFilter {
//   status?: string;
//   dateFrom?: string;
//   dateTo?: string;
// }

const props = defineProps<{
  quizAndAuthorIdentifier: QuizAndAuthorIdentifier;
  loading?: boolean;
  emptyMessage?: string;
}>();

const {
  sessions,
  pagination,
  handlePageChange,
  handleItemsPerPageChange,
  handleFilterChange,
  fetchSessions,
} = useSessionTable(props.quizAndAuthorIdentifier);
const toast = useToastStore();
const sessionStore = useSessionStore();

const emits = defineEmits(["load", "resume:session"]);
watch(sessions, () => {
  emits("load", sessions.value.total);
});
const sessionColumns: TableColumn[] = [
  {
    key: "startedAt",
    label: "Date de début",
    formatter: (value: string) => (value ? new Date(value).toLocaleString("fr-FR") : "-"),
  },
  {
    key: "finishedAt",
    label: "Date de fin",
    formatter: (value: string) => (value ? new Date(value).toLocaleString("fr-FR") : "-"),
  },
  {
    key: "status",
    label: "Statut",
    sortable: true,
    render: (value: string) => {
      if (value === "paused") return h(StatusBadge, { variant: "warning" }, () => "En pause");
      if (value === "active") return h(StatusBadge, { variant: "secondary" }, () => "En cours");
      if (value === "finished") return h(StatusBadge, { variant: "success" }, () => "Terminée");
      if (value === "pending") return h(StatusBadge, { variant: "info" }, () => "En attente");
    },
  },
  {
    key: "duration",
    label: "Durée",
    formatter: (value: number) => {
      if (value == null) return "-";
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes} min ${seconds} sec`;
    },
  },
  {
    key: "score",
    label: "Score",
    formatter: (value: number) => (value != null ? `${value} / ${10 || 0}` : "-"),
  },
];
const actions: TableAction[] = [
  {
    label: "Reprendre",
    icon: "Play",
    tooltip: "Reprendre cette session",
    variant: "warning",
    visible: (row) => row.status === "paused",
    handler: async (row) => {
      if (row && row.id) {
        await sessionStore.resumeSession(row.id);
        fetchSessions().then();
        toast.showToast("success", "Session reprise avec succès.");
        emits("resume:session", row.id);
        sessionStore.sessionId = row.id;
      }
    },
  },
];

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
</script>

<template>
  <!--    :filters="filters"-->
  <!--    :actions="props.actions"-->
  <!--    :columns="props.columns"-->
  <!--    :loading="props.loading"-->
  <DataTable
    :data="sessions.data"
    :rowKey="'id'"
    :searchable="false"
    :empty-message="props.emptyMessage || 'Aucune session trouvée pour ce quiz.'"
    :pagination="pagination"
    :columns="sessionColumns"
    :actions="actions"
    :filters="sessionFilters"
    @update:page="handlePageChange"
    @update:items-per-page="handleItemsPerPageChange"
    @update:filters="handleFilterChange"
  />

  <!--      search-placeholder="Rechercher un document..."
    empty-message="Aucun document trouvé"
    row-key="id"
    :pagination="pagination"
    @update:page="handlePageChange"
    @update:items-per-page="handleItemsPerPageChange"
    :data="sessions.data"
    :rowKey="'id'"
    :searchable="false"
    :empty-message="props.emptyMessage || 'Aucune session trouvée pour ce quiz.'"
    :pagination="pagination"-->
</template>
