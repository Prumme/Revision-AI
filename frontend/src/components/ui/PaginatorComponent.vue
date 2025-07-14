<script setup lang="ts">
import { computed } from "vue";
import SelectComponent from "../inputs/SelectComponent.vue";
import ButtonComponent from "../buttons/ButtonComponent.vue";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next";

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const props = defineProps<{
  hideItemsPerPage?: boolean;
  pagination: PaginationData;
  itemsPerPageOptions?: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  (e: "update:page", page: number): void;
  (e: "update:itemsPerPage", itemsPerPage: number): void;
}>();

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
</script>
<template>
  <div v-if="props.pagination">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <!-- Informations sur les éléments -->
      <div class="text-sm text-gray-700" v-if="props.pagination && !props.hideItemsPerPage">
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
        <div class="flex items-center gap-2" v-if="!props.hideItemsPerPage">
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
            size="default"
            :disabled="isFirstPageDisabled"
            @click="handlePageChange((props.pagination?.currentPage || 1) - 1)"
            class="!px-3 !py-1.5 !text-sm min-w-[40px] flex items-center justify-center"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </ButtonComponent>

          <template v-for="page in paginationPages" :key="page">
            <ButtonComponent
              :variant="page == props.pagination?.currentPage ? 'primary' : 'outline'"
              size="default"
              @click="handlePageChange(page)"
              class="!px-3 !py-1.5 !text-sm min-w-[40px]"
            >
              {{ page }}
            </ButtonComponent>
          </template>

          <ButtonComponent
            variant="outline"
            size="default"
            :disabled="isLastPageDisabled"
            @click="handlePageChange((props.pagination?.currentPage || 1) + 1)"
            class="!px-3 !py-1.5 !text-sm min-w-[40px] flex items-center justify-center"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </ButtonComponent>
        </div>
      </div>
    </div>
  </div>
</template>
