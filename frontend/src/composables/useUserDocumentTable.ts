import { h, onMounted, reactive, ref } from "vue";
import type { PaginatedResponse } from "@/types/pagination.ts";
import type { UploadedDocument } from "@/types/uploadedDocument.ts";
import type { TableAction, TableColumn } from "@/types/datatable.ts";
import AutoFileIcon from "@/components/icons/AutoFileIcon.vue";
import { AdminService } from "@/services/admin.service.ts";
import type { PaginationData } from "@/components/ui/PaginatorComponent.vue";
import { openDoc } from "@/utils/openDoc.ts";

export function useUserDocumentTable(userId: string | undefined) {
  const documents = ref<PaginatedResponse<UploadedDocument>>({
    data: [],
    total: 0,
    totalPages: 0,
    limit: 0,
    page: 0,
  });

  const pagination = reactive<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const actions: TableAction[] = [
    {
      label: "Voir",
      icon: "Eye",
      tooltip: "Ouvrir le document",
      variant: "primary",
      visible: () => true,
      handler: handleSeeDoc,
    },
  ];

  const documentColumns: TableColumn[] = [
    {
      key: "name",
      label: "Nom du fichier",
      sortable: true,
    },
    {
      key: "size",
      label: "Taille",
      formatter: (value: number) => {
        if (!value) return "-";
        const mb = value / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
      },
    },
    {
      key: "mimeType",
      label: "Type",
      render: (value: string) =>
        h(AutoFileIcon, {
          mimeType: value,
          class: "text-primary",
        }),
    },
    {
      key: "createdAt",
      label: "Date d'upload",
      sortable: true,
      formatter: (value: string) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-"),
    },
  ];

  function handleSeeDoc(doc: UploadedDocument) {
    openDoc(doc.identifier);
  }
  function handlePageChange(page: number) {
    console.log("Page change", page);
    pagination.currentPage = page;
    loadDocuments();
  }

  function handleItemsPerPageChange(items: number) {
    pagination.itemsPerPage = items;
    pagination.currentPage = 1;
    loadDocuments();
  }

  async function loadDocuments() {
    try {
      if (!userId) {
        console.error("Aucun utilisateur connecté");
        return;
      }
      documents.value = await AdminService.getUserDocuments(userId, {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
      });
      pagination.totalItems = documents.value.total;
      pagination.totalPages = documents.value.totalPages;
      //pagination.currentPage = documents.value.page;
      pagination.itemsPerPage = documents.value.limit;
    } catch (error) {
      console.error("Erreur lors du chargement des documents :", error);
    }
  }

  onMounted(loadDocuments);

  return {
    documents,
    pagination,
    documentColumns,
    actions,
    handlePageChange,
    handleItemsPerPageChange,
    loadDocuments,
  };
}
