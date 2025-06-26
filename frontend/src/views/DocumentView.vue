<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
// import { useUserStore } from "@/stores/user";
import { FileTextIcon, FileImageIcon, FileIcon, DownloadIcon, TrashIcon } from "lucide-vue-next";
import { ref } from "vue";
import { Document } from "@/types/document";

// const { getFullName } = useUserStore();

// Documents temporaires pour le développement
// TODO: Remplacer par fetchDocuments() plus tard
const documents = ref([
  {
    id: 1,
    name: "Cours de mathématiques.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Présentation projet.pptx",
    type: "presentation",
    size: "5.1 MB",
    uploadedAt: "2024-01-14",
  },
  {
    id: 3,
    name: "Notes de cours.docx",
    type: "document",
    size: "856 KB",
    uploadedAt: "2024-01-13",
  },
  {
    id: 4,
    name: "Schema architecture.png",
    type: "image",
    size: "1.2 MB",
    uploadedAt: "2024-01-12",
  },
]);

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
    case "document":
      return FileTextIcon;
    case "image":
      return FileImageIcon;
    default:
      return FileIcon;
  }
};

const getFileIconColor = (type: string) => {
  switch (type) {
    case "pdf":
      return "text-red-500";
    case "document":
      return "text-blue-500";
    case "image":
      return "text-green-500";
    case "presentation":
      return "text-orange-500";
    default:
      return "text-gray-500";
  }
};

const downloadDocument = (document: Document) => {
  // TODO: Implémenter la logique de téléchargement
  console.log("Téléchargement de:", document.name);
};

const deleteDocument = (document: Document) => {
  // TODO: Implémenter la logique de suppression
  console.log("Suppression de:", document.name);
  // Pour l'instant, on retire juste de la liste locale
  const index = documents.value.findIndex((doc) => doc.id === document.id);
  if (index > -1) {
    documents.value.splice(index, 1);
  }
};

// const fetchDocuments = async () => {
//   const response = await ApiService.get("/documents/me");
//   documents.value = response.data;
// };
</script>

<template>
  <section class="flex flex-col gap-1.5 w-full">
    <p class="font-outfit text-lg text-black-transparent">Gérez vos documents</p>
    <h1 class="font-outfit text-4xl font-extrabold text-black">
      Mes <span class="text-primary">Documents</span>
    </h1>

    <!-- Liste des documents -->
    <div class="mt-8">
      <div v-if="documents.length === 0" class="text-center py-12">
        <FileIcon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
        <p class="text-gray-500">Commencez par ajouter votre premier document</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="document in documents"
          :key="document.id"
          class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
        >
          <!-- Informations du fichier -->
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <!-- Icône du type de fichier -->
            <div class="flex-shrink-0">
              <component
                :is="getFileIcon(document.type)"
                :class="['w-8 h-8', getFileIconColor(document.type)]"
              />
            </div>

            <!-- Détails du fichier -->
            <div class="min-w-0 flex-1">
              <h3 class="text-sm font-medium text-gray-900 truncate">
                {{ document.name }}
              </h3>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>{{ document.size }}</span>
                <span>•</span>
                <span>{{ document.uploadedAt }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 ml-4">
            <Button
              variant="secondary"
              size="icon"
              @click="downloadDocument(document)"
              class="group"
              title="Télécharger"
            >
              <DownloadIcon
                class="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
              />
            </Button>

            <Button
              variant="danger"
              size="icon"
              @click="deleteDocument(document)"
              class="group"
              title="Supprimer"
            >
              <TrashIcon class="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
