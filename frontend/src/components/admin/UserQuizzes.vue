<script setup lang="ts">
import { FileText } from "lucide-vue-next";
import { h } from "vue";
import CardComponent from "@/components/cards/CardComponent.vue";
import DataTable from "@/components/tables/DataTable.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { Quiz } from "@/types/quiz";
import type { TableColumn } from "@/types/datatable";

defineProps<{
  quizzes: Quiz[];
}>();

const quizColumns: TableColumn[] = [
  {
    key: "title",
    label: "Titre du Quiz",
    sortable: true,
  },
  {
    key: "questionsCount",
    label: "Nb. Questions",
    sortable: true,
  },
  {
    key: "status",
    label: "Statut",
    render: (value: string) =>
      h(
        StatusBadge,
        {
          variant: value === "published" ? "success" : value === "draft" ? "warning" : "secondary",
        },
        () => (value === "published" ? "Publié" : value === "draft" ? "Brouillon" : "Archivé"),
      ),
  },
  {
    key: "createdAt",
    label: "Date de création",
    sortable: true,
    formatter: (value: string) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-"),
  },
];
</script>

<template>
  <CardComponent>
    <template #header>
      <div class="flex items-center gap-2 mb-4">
        <FileText class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900">Quiz Générés ({{ quizzes.length }})</h2>
      </div>
    </template>
    <template #content>
      <DataTable
        v-if="quizzes.length > 0"
        :data="quizzes"
        :columns="quizColumns"
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
