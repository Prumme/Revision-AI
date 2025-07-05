<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-vue-next";
import DynamicIcon from "@/components/icons/DynamicIcon.vue";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import InputComponent from "@/components/inputs/InputComponent.vue";
import SelectComponent from "@/components/inputs/SelectComponent.vue";
import type {
  DataTableProps,
  TableEmits,
  TableSort,
  TableFilters,
  TableColumn,
} from "@/types/datatable";

const props = withDefaults(defineProps<DataTableProps>(), {
  loading: false,
  searchable: true,
  searchPlaceholder: "Rechercher...",
  emptyMessage: "Aucune donnée disponible",
  rowKey: "id",
});

const emit = defineEmits<TableEmits>();

// État local
const search = ref("");
const filters = ref<TableFilters>({});
const sort = ref<TableSort | null>(null);

// Initialiser les filtres avec les valeurs par défaut
if (props.filters) {
  props.filters.forEach((filter) => {
    filters.value[filter.key] = props.initialFilters?.[filter.key] || "";
  });
}

// Watchers pour émettre les changements
watch(search, (value) => {
  emit("update:search", value);
});

watch(
  filters,
  (value) => {
    emit("update:filters", value);
  },
  { deep: true },
);

watch(sort, (value) => {
  emit("update:sort", value);
});

// Gestion du tri
const handleSort = (column: string) => {
  const col = props.columns.find((c) => c.key === column);
  if (!col?.sortable) return;

  if (!sort.value || sort.value.column !== column) {
    sort.value = { column, direction: "asc" };
  } else if (sort.value.direction === "asc") {
    sort.value = { column, direction: "desc" };
  } else {
    sort.value = null;
  }
};

// Gestion de la pagination
const handlePageChange = (page: number) => {
  emit("update:page", page);
};

const handleItemsPerPageChange = (items: string) => {
  emit("update:itemsPerPage", parseInt(items));
};

// Options pour les éléments par page (modifiable via props)
const itemsPerPageOptions = computed(() => {
  // Si des options personnalisées sont passées via props, les utiliser
  if (props.itemsPerPageOptions) {
    return props.itemsPerPageOptions;
  }
  // Sinon, utiliser les options par défaut
  return [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ];
});

// Calculer les pages pour la pagination
const paginationPages = computed(() => {
  if (!props.pagination) return [];

  const { currentPage, totalPages } = props.pagination;
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Computed pour les conditions de désactivation des boutons
const isFirstPageDisabled = computed(() => {
  if (!props.pagination) return true;
  return props.pagination.currentPage <= 1;
});

const isLastPageDisabled = computed(() => {
  if (!props.pagination) return true;
  return props.pagination.currentPage >= props.pagination.totalPages;
});

// Formater une valeur de cellule
const formatCellValue = (column: TableColumn, value: string, row: string) => {
  if (column.formatter) {
    return column.formatter(value, row);
  }
  return value;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header avec recherche et filtres -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <!-- Recherche -->
        <div v-if="searchable" class="flex-1 max-w-md">
          <div class="relative">
            <SearchIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <input
              v-model="search"
              type="text"
              :placeholder="searchPlaceholder"
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md outline-none text-sm text-black focus:border-primary"
            />
          </div>
        </div>

        <!-- Filtres -->
        <div v-if="props.filters" class="flex flex-wrap gap-3">
          <template v-for="filter in props.filters" :key="filter.key">
            <div class="min-w-[150px]">
              <SelectComponent
                v-if="filter.type === 'select'"
                :id="filter.key"
                v-model="filters[filter.key]"
                :label="filter.label"
                :options="filter.options || []"
                :placeholder="filter.placeholder"
              />
              <InputComponent
                v-else
                :id="filter.key"
                v-model="filters[filter.key]"
                :label="filter.label"
                :placeholder="filter.placeholder"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- En-tête -->
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.width ? column.width : '',
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : '',
              ]"
              @click="column.sortable ? handleSort(column.key) : undefined"
            >
              <div class="flex items-center gap-2">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUpIcon
                    :class="[
                      'w-3 h-3',
                      sort?.column === column.key && sort?.direction === 'asc'
                        ? 'text-primary'
                        : 'text-gray-300',
                    ]"
                  />
                  <ChevronDownIcon
                    :class="[
                      'w-3 h-3 -mt-1',
                      sort?.column === column.key && sort?.direction === 'desc'
                        ? 'text-primary'
                        : 'text-gray-300',
                    ]"
                  />
                </div>
              </div>
            </th>
            <th
              v-if="actions && actions.length > 0"
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>

        <!-- Corps du tableau -->
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- État de chargement -->
          <tr v-if="loading">
            <td
              :colspan="columns.length + (actions?.length ? 1 : 0)"
              class="px-6 py-12 text-center"
            >
              <div class="flex justify-center items-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span class="ml-3 text-gray-500">Chargement...</span>
              </div>
            </td>
          </tr>

          <!-- Aucune donnée -->
          <tr v-else-if="data.length === 0">
            <td
              :colspan="columns.length + (actions?.length ? 1 : 0)"
              class="px-6 py-12 text-center text-gray-500"
            >
              {{ emptyMessage }}
            </td>
          </tr>

          <!-- Données -->
          <tr
            v-else
            v-for="(row, index) in data"
            :key="row[rowKey] || index"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <component v-if="column.render" :is="column.render(row[column.key], row)" />
              <span v-else>
                {{ formatCellValue(column, row[column.key], row) }}
              </span>
            </td>

            <!-- Actions -->
            <td
              v-if="actions && actions.length > 0"
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div class="flex justify-end gap-2">
                <template v-for="action in actions" :key="action.label">
                  <button
                    v-if="!action.visible || action.visible(row)"
                    :disabled="action.disabled ? action.disabled(row) : false"
                    @click="action.handler(row)"
                    :title="action.tooltip || action.label"
                    :class="[
                      'p-2 rounded-md transition-colors duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed',
                      {
                        'text-blue-600 hover:bg-blue-100':
                          action.variant === 'primary' || !action.variant,
                        'text-gray-600 hover:bg-gray-100': action.variant === 'outline',
                        'text-red-600 hover:bg-red-100': action.variant === 'danger',
                        'text-primary hover:bg-primary/80 hover:text-white':
                          action.variant === 'yellow',
                      },
                    ]"
                  >
                    <DynamicIcon v-if="action.icon" :name="action.icon" :size="16" />
                    <span v-else class="text-xs">{{ action.label }}</span>
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="props.pagination" class="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
        <!-- Informations sur les éléments -->
        <div class="text-sm text-gray-700" v-if="props.pagination">
          Affichage de
          {{ (props.pagination.currentPage - 1) * props.pagination.itemsPerPage + 1 }} à
          {{
            Math.min(
              props.pagination.currentPage * props.pagination.itemsPerPage,
              props.pagination.totalItems,
            )
          }}
          sur {{ props.pagination.totalItems }} éléments
        </div>

        <!-- Contrôles de pagination -->
        <div class="flex items-center gap-4">
          <!-- Éléments par page -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">Par page:</span>
            <SelectComponent
              id="itemsPerPage"
              :model-value="props.pagination?.itemsPerPage?.toString() || '10'"
              :options="itemsPerPageOptions"
              @update:model-value="handleItemsPerPageChange"
              class="!mt-0"
            />
          </div>

          <!-- Navigation -->
          <div class="flex items-center gap-1">
            <ButtonComponent
              variant="outline"
              size="icon"
              :disabled="isFirstPageDisabled"
              @click="handlePageChange((props.pagination?.currentPage || 1) - 1)"
              class="!p-2"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </ButtonComponent>

            <template v-for="page in paginationPages" :key="page">
              <ButtonComponent
                :variant="page === props.pagination?.currentPage ? 'primary' : 'outline'"
                size="default"
                @click="handlePageChange(page)"
                class="!px-3 !py-1.5 !text-sm min-w-[40px]"
              >
                {{ page }}
              </ButtonComponent>
            </template>

            <ButtonComponent
              variant="outline"
              size="icon"
              :disabled="isLastPageDisabled"
              @click="handlePageChange((props.pagination?.currentPage || 1) + 1)"
              class="!p-2"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </ButtonComponent>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
