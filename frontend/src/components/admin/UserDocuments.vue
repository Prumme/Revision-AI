<script setup lang="ts">
import { Mail } from "lucide-vue-next";
import { h } from "vue";
import CardComponent from "@/components/cards/CardComponent.vue";
import DataTable from "@/components/tables/DataTable.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { Document } from "@/types/document";
import type { TableColumn } from "@/types/datatable";

defineProps<{
  documents: Document[];
}>();

const documentColumns: TableColumn[] = [
  {
    key: "filename",
    label: "Nom du fichier",
    sortable: true,
  },
  {
    key: "fileSize",
    label: "Taille",
    formatter: (value: number) => {
      if (!value) return "-";
      const mb = value / (1024 * 1024);
      return `${mb.toFixed(2)} MB`;
    },
  },
  {
    key: "fileType",
    label: "Type",
    render: (value: string) =>
      h(
        StatusBadge,
        {
          variant: value === "pdf" ? "info" : value === "image" ? "secondary" : "warning",
        },
        () => value.toUpperCase(),
      ),
  },
  {
    key: "uploadedAt",
    label: "Date d'upload",
    sortable: true,
    formatter: (value: string) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-"),
  },
];
</script>

<template>
  <CardComponent>
    <template #header>
      <div class="flex items-center gap-2 mb-4">
        <Mail class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900">
          Documents Uploadés ({{ documents.length }})
        </h2>
      </div>
    </template>
    <template #content>
      <DataTable
        v-if="documents.length > 0"
        :data="documents"
        :columns="documentColumns"
        :searchable="true"
        search-placeholder="Rechercher un document..."
        empty-message="Aucun document trouvé"
        row-key="id"
      />
      <div v-else class="text-center py-8 text-gray-500">
        <Mail class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun document uploadé par cet utilisateur</p>
      </div>
    </template>
  </CardComponent>
</template>
