<script setup lang="ts">
import { ref, onMounted, h } from "vue";
import { useToastStore } from "@/stores/toast";
import DataTable from "@/components/tables/DataTable.vue";
import type { TableColumn, TableAction, PaginationData, TableSort } from "@/types/datatable";
import { useRouter } from "vue-router";
import { AdminService } from "@/services/admin.service";
import StatusBadge from "../../components/badges/StatusBadge.vue";
import type { Report } from "@/types/report";

const toast = useToastStore();
const router = useRouter();

// État
const unresolvedReports = ref<Report[]>([]);
const resolvedReports = ref<Report[]>([]);
const loadingUnresolved = ref(false);
const loadingResolved = ref(false);

const unresolvedPagination = ref<PaginationData>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 5,
});

const resolvedPagination = ref<PaginationData>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 5,
});

// État pour la recherche et le tri
const unresolvedSearch = ref("");
const resolvedSearch = ref("");
const unresolvedSort = ref<TableSort | null>(null);
const resolvedSort = ref<TableSort | null>(null);

// Variable pour le timeout de debounce
let unresolvedSearchTimeout: NodeJS.Timeout | null = null;
let resolvedSearchTimeout: NodeJS.Timeout | null = null;

// Configuration des colonnes
const columns: TableColumn[] = [
  {
    key: "type",
    label: "Type",
    render: (value: string) =>
      h(
        StatusBadge,
        {
          variant: value === "user" ? "warning" : "info",
        },
        () => (value === "user" ? "Utilisateur" : "Quiz"),
      ),
  },
  {
    key: "targetName",
    label: "Élément signalé",
    sortable: true,
  },
  {
    key: "reasons",
    label: "Signalements",
    render: (reasons: ReportReason[] | undefined) => {
      if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
        return h("span", { class: "text-gray-500" }, "Aucun signalement");
      }
      return h("div", { class: "flex flex-col" }, [
        h(
          "span",
          { class: "font-medium" },
          `${reasons.length} signalement${reasons.length > 1 ? "s" : ""}`,
        ),
        h(
          "span",
          { class: "text-sm text-gray-500" },
          `Dernier: ${new Date(reasons[reasons.length - 1].createdAt).toLocaleDateString("fr-FR")}`,
        ),
      ]);
    },
  },
  {
    key: "reasons",
    label: "Dernier signalement",
    formatter: (reasons: ReportReason[] | undefined) => {
      if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
        return "Aucune raison";
      }
      const lastReason = reasons[reasons.length - 1];
      return lastReason.reason.length > 50
        ? `${lastReason.reason.substring(0, 50)}...`
        : lastReason.reason;
    },
  },
  {
    key: "resolved",
    label: "Statut",
    render: (value: boolean) =>
      h(
        StatusBadge,
        {
          variant: value ? "success" : "warning",
        },
        () => (value ? "Résolu" : "Non résolu"),
      ),
  },
];

// Configuration des actions
const unresolvedActions: TableAction[] = [
  {
    label: "Voir les détails",
    icon: "Eye",
    tooltip: "Voir les détails du signalement",
    variant: "primary",
    handler: (report) => router.push(`/admin/reports/${report._id}`),
  },
  {
    label: "Voir l'élément",
    icon: "ExternalLink",
    tooltip: "Voir l'élément signalé dans un nouvel onglet",
    variant: "outline",
    handler: (report) => handleSeeTargetNewTab(report),
  },
  {
    label: "Résoudre",
    icon: "CheckCircle",
    tooltip: "Marquer comme résolu",
    variant: "success",
    visible: (report) => !report.resolved,
    handler: handleResolveReport,
  },
];

const resolvedActions: TableAction[] = [
  {
    label: "Voir les détails",
    icon: "Eye",
    tooltip: "Voir les détails du signalement",
    variant: "primary",
    handler: (report) => router.push(`/admin/reports/${report._id}`),
  },
  {
    label: "Voir l'élément",
    icon: "ExternalLink",
    tooltip: "Voir l'élément signalé dans un nouvel onglet",
    variant: "outline",
    handler: (report) => handleSeeTargetNewTab(report),
  },
];

// Options pour les éléments par page
const itemsPerPageOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
];

function handleUnresolvedSearch(query: string) {
  unresolvedSearch.value = query;

  if (unresolvedSearchTimeout) {
    clearTimeout(unresolvedSearchTimeout);
  }

  unresolvedSearchTimeout = setTimeout(() => {
    unresolvedPagination.value.currentPage = 1;
    loadReports(false);
  }, 500);
}

function handleResolvedSearch(query: string) {
  resolvedSearch.value = query;

  if (resolvedSearchTimeout) {
    clearTimeout(resolvedSearchTimeout);
  }

  resolvedSearchTimeout = setTimeout(() => {
    resolvedPagination.value.currentPage = 1;
    loadReports(true);
  }, 500);
}

function handleUnresolvedSort(sort: TableSort | null) {
  unresolvedSort.value = sort;
  unresolvedPagination.value.currentPage = 1;
  loadReports(false);
}

function handleResolvedSort(sort: TableSort | null) {
  resolvedSort.value = sort;
  resolvedPagination.value.currentPage = 1;
  loadReports(true);
}

function handleUnresolvedPageChange(page: number) {
  unresolvedPagination.value.currentPage = page;
  loadReports(false);
}

function handleResolvedPageChange(page: number) {
  resolvedPagination.value.currentPage = page;
  loadReports(true);
}

function handleUnresolvedItemsPerPageChange(items: number) {
  unresolvedPagination.value.itemsPerPage = items;
  unresolvedPagination.value.currentPage = 1;
  loadReports(false);
}

function handleResolvedItemsPerPageChange(items: number) {
  resolvedPagination.value.itemsPerPage = items;
  resolvedPagination.value.currentPage = 1;
  loadReports(true);
}

async function loadReports(resolved: boolean = false) {
  try {
    if (resolved) {
      loadingResolved.value = true;
    } else {
      loadingUnresolved.value = true;
    }

    const pagination = resolved ? resolvedPagination.value : unresolvedPagination.value;
    const search = resolved ? resolvedSearch.value : unresolvedSearch.value;
    const sort = resolved ? resolvedSort.value : unresolvedSort.value;

    const params = {
      resolved,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      search: search?.trim() || undefined, // Ne pas envoyer une chaîne vide
      sortBy: sort?.column,
      sortOrder: sort?.direction,
    };

    const response = await AdminService.getReports(params);

    if (resolved) {
      resolvedReports.value = response.data || [];
      resolvedPagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 1,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 10,
      };
    } else {
      unresolvedReports.value = response.data || [];
      unresolvedPagination.value = {
        currentPage: response.page || 1,
        totalPages: response.totalPages || 1,
        totalItems: response.total || 0,
        itemsPerPage: response.limit || 10,
      };
    }
  } catch {
    toast.showToast("error", "Erreur lors du chargement des signalements");
  } finally {
    if (resolved) {
      loadingResolved.value = false;
    } else {
      loadingUnresolved.value = false;
    }
  }
}

function handleSeeTargetNewTab(report: Report) {
  const url =
    report.type === "quiz" ? `/quiz/${report.targetId}` : `/admin/users/${report.targetId}`;
  window.open(url, "_blank");
}

async function handleResolveReport(report: Report) {
  try {
    await AdminService.resolveReport(report._id);
    toast.showToast("success", "Le signalement a été marqué comme résolu");
    // Recharger les deux listes car le signalement va passer de non résolu à résolu
    await Promise.all([loadReports(false), loadReports(true)]);
  } catch {
    toast.showToast("error", "Erreur lors de la résolution du signalement");
  }
}

// Chargement initial
onMounted(() => {
  loadReports(false);
  loadReports(true);
});
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gestion des signalements</h1>
      <p class="text-gray-600 mt-2">Modérez les signalements d'utilisateurs et de quiz</p>
    </div>

    <!-- Signalements non résolus -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Signalements en attente</h2>
      <DataTable
        :data="unresolvedReports"
        :columns="columns"
        :actions="unresolvedActions"
        :loading="loadingUnresolved"
        :pagination="unresolvedPagination"
        :items-per-page-options="itemsPerPageOptions"
        search-placeholder="Rechercher un signalement..."
        empty-message="Aucun signalement en attente"
        @update:search="handleUnresolvedSearch"
        @update:sort="handleUnresolvedSort"
        @update:page="handleUnresolvedPageChange"
        @update:itemsPerPage="handleUnresolvedItemsPerPageChange"
      />
    </div>

    <!-- Signalements résolus -->
    <div>
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Signalements résolus</h2>
      <DataTable
        :data="resolvedReports"
        :columns="columns"
        :actions="resolvedActions"
        :loading="loadingResolved"
        :pagination="resolvedPagination"
        :items-per-page-options="itemsPerPageOptions"
        search-placeholder="Rechercher un signalement résolu..."
        empty-message="Aucun signalement résolu"
        @update:search="handleResolvedSearch"
        @update:sort="handleResolvedSort"
        @update:page="handleResolvedPageChange"
        @update:itemsPerPage="handleResolvedItemsPerPageChange"
      />
    </div>
  </div>
</template>
