<script setup lang="ts">
import { Download, FileText } from "lucide-vue-next";
import { ApiService } from "@/services/api.service";
import CardComponent from "@/components/cards/CardComponent.vue";

// Pour l'instant on accepte soit des strings (chemins) soit des objets avec une propriété path
const props = defineProps<{
  documents: string[];
  scrollable?: boolean;
}>();

console.log(props.documents);

// Fonction pour extraire le nom du fichier depuis le chemin
const getFileName = (item: string): string => {
  console.log(item);
  return item.split("/").pop() || item;
};

const downloadFile = async (item: string) => {
  const response = await ApiService.getFile(`/files/${item}`);
  //ouvrir le fichier dans un nouvel onglet
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Tu peux récupérer le nom depuis les headers, ou définir un nom fixe :
  const disposition = response.headers.get("content-disposition");
  const match = disposition?.match(/filename="(.+)"/);
  a.download = match ? match[1] : "fichier.pdf";

  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
</script>

<template>
  <CardComponent>
    <template #header>
      <div class="flex items-center gap-2">
        <FileText class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900">
          Documents Uploadés ({{ documents.length }})
        </h2>
      </div>
    </template>
    <template #content>
      <div v-if="props.documents.length > 0">
        <div
          :class="[
            'divide-y divide-gray-200',
            props.scrollable !== false ? 'max-h-32 overflow-y-scroll' : '',
          ]"
        >
          <div
            v-for="(document, index) in props.documents"
            :key="index"
            class="flex items-center justify-between py-4"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center">
                <FileText class="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ getFileName(document) }}
                </p>
              </div>
            </div>
            <button
              @click="downloadFile(document)"
              class="text-gray-500 hover:text-gray-700 ml-4 p-1 rounded-md hover:bg-gray-100"
              :title="`Télécharger ${getFileName(document)}`"
            >
              <Download class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <FileText class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun document uploadé par cet utilisateur</p>
      </div>
    </template>
  </CardComponent>
</template>
