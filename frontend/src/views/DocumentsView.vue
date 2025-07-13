<script setup lang="ts">
import { Motion } from "@motionone/vue";
import { Mail } from "lucide-vue-next";
import { useUserStore } from "@/stores/user.ts";
import DataTable from "@/components/tables/DataTable.vue";
import { useUserDocumentTable } from "@/composables/useUserDocumentTable.ts";

const userStore = useUserStore();
const {
  documents,
  pagination,
  documentColumns,
  actions,
  handlePageChange,
  handleItemsPerPageChange,
} = useUserDocumentTable(userStore?.user?.id);
</script>

<template>
  <section class="flex flex-col gap-1.5 w-full">
    <p class="font-outfit text-lg text-black-transparent">Tous tes médias</p>
    <h1 class="font-outfit text-4xl font-extrabold text-black">Cours importés</h1>
    <Motion
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }"
    >
      <div class="mt-6">
        <DataTable
          v-if="documents.total > 0"
          :actions
          :data="documents.data"
          :columns="documentColumns"
          :searchable="true"
          search-placeholder="Rechercher un document..."
          empty-message="Aucun document trouvé"
          row-key="id"
          :pagination="pagination"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
        />
        <div v-else class="text-center py-8 text-gray-500">
          <Mail class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucun document uploadé par cet utilisateur</p>
        </div>
      </div>
    </Motion>
  </section>
</template>

<style scoped></style>
