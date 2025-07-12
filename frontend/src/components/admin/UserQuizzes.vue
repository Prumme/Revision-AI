<script setup lang="ts">
import { FileText } from "lucide-vue-next";
import { h } from "vue";
import { useRouter } from "vue-router";
import CardComponent from "@/components/cards/CardComponent.vue";
import DataTable from "@/components/tables/DataTable.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { Quiz } from "@/types/quiz";
import type { TableColumn, TableAction } from "@/types/datatable";

defineProps<{
  quizzes: Quiz[];
}>();

const router = useRouter();

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
        :data="quizzes"
        :columns="quizColumns"
        :actions="quizActions"
        :searchable="true"
        search-placeholder="Rechercher un quiz..."
        empty-message="Aucun quiz trouvé"
        row-key="id"
      />
      <div v-else class="text-center py-8 text-gray-500">
        <FileText class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun quiz généré par cet utilisateur</p>
      </div>
    </template>
  </CardComponent>
</template>
