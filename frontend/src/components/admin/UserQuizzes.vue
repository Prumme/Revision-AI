<script setup lang="ts">
import { FileText } from "lucide-vue-next";
import { h, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import CardComponent from "@/components/cards/CardComponent.vue";
import DataTable from "@/components/tables/DataTable.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { Quiz } from "@/types/quiz";
import type { TableColumn, TableAction } from "@/types/datatable";
import type { PaginationData } from "@/types/datatable";

const props = defineProps<{
  quizzes: Quiz[];
}>();

const router = useRouter();

// État pour la pagination
const pagination = ref<PaginationData>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 5, // Valeur par défaut
});

// Options pour les éléments par page
const itemsPerPageOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
];

// Données paginées côté client
const paginatedQuizzes = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage;
  const end = start + pagination.value.itemsPerPage;
  return props.quizzes.slice(start, end);
});

// Mise à jour de la pagination quand les données changent
function updatePagination() {
  const totalItems = props.quizzes.length;
  const totalPages = Math.ceil(totalItems / pagination.value.itemsPerPage);

  pagination.value = {
    ...pagination.value,
    totalItems,
    totalPages,
  };

  // S'assurer que la page actuelle est valide
  if (pagination.value.currentPage > totalPages && totalPages > 0) {
    pagination.value.currentPage = totalPages;
  }
}

// Handlers pour la pagination
function handlePageChange(page: number) {
  pagination.value.currentPage = page;
}

function handleItemsPerPageChange(items: number) {
  pagination.value.itemsPerPage = items;
  pagination.value.currentPage = 1; // Reset à la première page
  updatePagination();
}

// Mise à jour de la pagination au montage et quand les données changent
onMounted(() => {
  updatePagination();
});

// Watcher pour mettre à jour la pagination quand les props changent
import { watch } from "vue";
watch(
  () => props.quizzes,
  () => {
    updatePagination();
  },
  { deep: true },
);

const quizColumns: TableColumn[] = [
  {
    key: "title",
    label: "Titre du Quiz",
    sortable: true,
  },
  {
    key: "questionsNumbers",
    label: "Nb. Questions",
    sortable: true,
  },
  {
    key: "isPublic",
    label: "Public",
    render: (value: boolean) =>
      h(
        StatusBadge,
        {
          variant: value ? "success" : "secondary",
          class: "text-xs",
        },
        () => (value ? "Public" : "Privé"),
      ),
  },
  {
    key: "createdAt",
    label: "Date de création",
    sortable: true,
    formatter: (value: string) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-"),
  },
];

const quizActions: TableAction[] = [
  {
    label: "Voir",
    icon: "Eye",
    tooltip: "Voir ce quiz",
    variant: "primary",
    handler: handleViewQuiz,
  },
];

function handleViewQuiz(quiz: Quiz) {
  router.push(`/quiz/${quiz.id}`);
}
</script>

<template>
  <CardComponent>
    <template #header>
      <div class="flex items-center gap-2">
        <FileText class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900">Quiz Générés ({{ quizzes.length }})</h2>
      </div>
    </template>
    <template #content>
      <DataTable
        v-if="quizzes.length > 0"
        :data="paginatedQuizzes"
        :columns="quizColumns"
        :actions="quizActions"
        :searchable="true"
        :pagination="pagination"
        :items-per-page-options="itemsPerPageOptions"
        search-placeholder="Rechercher un quiz..."
        empty-message="Aucun quiz trouvé"
        row-key="id"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
      <div v-else class="text-center py-8 text-gray-500">
        <FileText class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun quiz généré par cet utilisateur</p>
      </div>
    </template>
  </CardComponent>
</template>
