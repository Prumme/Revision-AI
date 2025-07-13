<script setup lang="ts">
import { Mail } from "lucide-vue-next";
import CardComponent from "@/components/cards/CardComponent.vue";
import DataTable from "@/components/tables/DataTable.vue";
import { useUserDocumentTable } from "@/composables/useUserDocumentTable.ts";

const props = defineProps<{
  userId: string;
}>();
const {
  documents,
  pagination,
  documentColumns,
  actions,
  handlePageChange,
  handleItemsPerPageChange,
} = useUserDocumentTable(props.userId);
</script>

<template>
  <CardComponent>
    <template #header>
      <div class="flex items-center gap-2 mb-4">
        <Mail class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900">
          Documents Uploadés ({{ documents.total }})
        </h2>
      </div>
    </template>
    <template #content>
      <DataTable
        v-if="documents.total > 0"
        :actions="actions"
        :data="documents.data"
        :columns="documentColumns"
        :searchable="true"
        search-placeholder="Rechercher un document..."
        empty-message="Aucun document trouvé"
        row-key="identifier"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:items-per-page="handleItemsPerPageChange"
      />
      <div v-else class="text-center py-8 text-gray-500">
        <Mail class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun document uploadé par cet utilisateur</p>
      </div>
    </template>
  </CardComponent>
</template>
