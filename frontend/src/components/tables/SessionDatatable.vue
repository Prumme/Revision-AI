<script setup lang="ts">
import { ref, computed } from 'vue';
import DataTable from './DataTable.vue';
import type { TableAction, TableColumn } from '@/types/datatable';
import type { Session } from '@/types/session';

// Définition stricte du type de filtre pour les sessions
interface SessionDatatableFilter {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

const props = defineProps<{
  data: Session[],
  actions?: TableAction[],
  columns: TableColumn[],
  loading?: boolean,
  rowKey?: string,
  emptyMessage?: string,
}>();

// État local des filtres
const filters = ref<SessionDatatableFilter>({});

// Fonction de filtrage locale
const filteredData = computed(() => {
  return props.data.filter((session) => {
    let match = true;
    if (filters.value.status && session.status !== filters.value.status) {
      match = false;
    }
    if (filters.value.dateFrom && new Date(session.createdAt) < new Date(filters.value.dateFrom)) {
      match = false;
    }
    if (filters.value.dateTo && new Date(session.createdAt) > new Date(filters.value.dateTo)) {
      match = false;
    }
    return match;
  });
});
</script>

<template>
  <DataTable
    :data="filteredData"
    :actions="props.actions"
    :columns="props.columns"
    :loading="props.loading"
    :filters="filters"
    :rowKey="props.rowKey || 'id'"
    :searchable="false"
    :empty-message="props.emptyMessage || 'Aucune session trouvée pour ce quiz.'"
  />
</template>
