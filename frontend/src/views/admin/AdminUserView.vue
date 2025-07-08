<script setup lang="ts">
import { ref, onMounted, h } from "vue";
import { useToastStore } from "@/stores/toast";
import DataTable from "@/components/tables/DataTable.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import { AdminService } from "@/services/admin.service";
import type { User } from "@/types/user";
import type {
  TableColumn,
  TableAction,
  TableFilter,
  TableSort,
  TableFilters,
  PaginationData,
} from "@/types/datatable";
import type {
  UserTableFilters,
  UserApiFilters,
  BlockedFilterValue,
  DeletedFilterValue,
} from "@/types/admin";
import { useRouter } from "vue-router";

const toast = useToastStore();
const router = useRouter();

// Types pour le cache
interface CacheKey {
  filters: string;
  search: string;
  sort: string;
  page: number;
  limit: number;
}

interface CacheEntry {
  data: User[];
  pagination: PaginationData;
  timestamp: number;
}

// État
const users = ref<User[]>([]);
const loading = ref(false);
const currentFilters = ref<UserTableFilters>({
  blockedFilter: "unblocked",
  deletedFilter: "active",
});
const currentSort = ref<TableSort | null>(null);
const searchQuery = ref("");
const pagination = ref<PaginationData>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 5, // Valeur par défaut selon les options (5, 10, 15)
});

// Cache des résultats
const cache = ref<Map<string, CacheEntry>>(new Map());
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Configuration des colonnes
const columns: TableColumn[] = [
  {
    key: "username",
    label: "Nom d'utilisateur",
    sortable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
  },
  {
    key: "role",
    label: "Rôle",
    sortable: true,
    render: (value: string) =>
      h(
        StatusBadge,
        {
          variant: value === "admin" ? "info" : "secondary",
        },
        () => (value === "admin" ? "Administrateur" : "Utilisateur"),
      ),
  },
  {
    key: "emailVerified",
    label: "Email vérifié",
    render: (value: boolean) =>
      h(
        StatusBadge,
        {
          variant: value ? "success" : "warning",
        },
        () => (value ? "Vérifié" : "Non vérifié"),
      ),
  },
  {
    key: "blocked",
    label: "Statut",
    render: (value: boolean, row: User) => {
      if (row.deleted) {
        return h(StatusBadge, { variant: "secondary" }, () => "Supprimé");
      }
      if (value) {
        return h(StatusBadge, { variant: "danger" }, () => "Bloqué");
      }
      return h(StatusBadge, { variant: "success" }, () => "Actif");
    },
  },
  {
    key: "createdAt",
    label: "Date de création",
    sortable: true,
    formatter: (value: string) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-"),
  },
];

// Configuration des actions
const actions: TableAction[] = [
  {
    label: "Voir",
    icon: "Eye",
    tooltip: "Voir cet utilisateur",
    variant: "primary",
    visible: (row: User) => !row.blocked && !row.deleted,
    handler: handleSeeUser,
  },
  {
    label: "Bloquer",
    icon: "Ban",
    tooltip: "Bloquer cet utilisateur",
    variant: "danger",
    visible: (row: User) => !row.blocked && !row.deleted,
    handler: handleBlockUser,
  },
  {
    label: "Débloquer",
    icon: "RotateCcw",
    tooltip: "Débloquer cet utilisateur",
    variant: "primary",
    visible: (row: User) => row.blocked && !row.deleted,
    handler: handleUnblockUser,
  },
];

// Options pour les éléments par page (5, 10, 15 comme demandé)
const itemsPerPageOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
];

// Configuration des filtres
const filters: TableFilter[] = [
  {
    key: "blockedFilter",
    label: "Statut de blocage",
    type: "select",
    placeholder: "Tous les statuts",
    options: [
      { label: "Tous", value: "all" },
      { label: "Non bloqués", value: "unblocked" },
      { label: "Bloqués", value: "blocked" },
    ],
  },
  {
    key: "deletedFilter",
    label: "Statut de suppression",
    type: "select",
    placeholder: "Tous les statuts",
    options: [
      { label: "Tous", value: "all" },
      { label: "Non supprimés", value: "active" },
      { label: "Supprimés", value: "deleted" },
    ],
  },
];

// Fonctions utilitaires pour le cache
function generateCacheKey(): string {
  const key: CacheKey = {
    filters: JSON.stringify(currentFilters.value),
    search: searchQuery.value,
    sort: JSON.stringify(currentSort.value),
    page: pagination.value.currentPage,
    limit: pagination.value.itemsPerPage,
  };
  return JSON.stringify(key);
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cache.value.entries()) {
    if (now - entry.timestamp >= CACHE_DURATION) {
      cache.value.delete(key);
    }
  }
}

function clearCacheForFilters() {
  // Supprimer toutes les entrées de cache quand les filtres changent
  cache.value.clear();
}

// Méthodes
async function loadUsers(forceRefresh = false) {
  try {
    loading.value = true;

    // Nettoyer le cache expiré
    clearExpiredCache();

    // Générer la clé de cache
    const cacheKey = generateCacheKey();

    // Vérifier si on a une entrée valide en cache
    if (!forceRefresh && cache.value.has(cacheKey)) {
      const cachedEntry = cache.value.get(cacheKey)!;
      if (isCacheValid(cachedEntry)) {
        users.value = cachedEntry.data;
        pagination.value = { ...cachedEntry.pagination };
        return;
      }
    }

    // Convertir les filtres de l'interface vers l'API
    const apiFilters: UserApiFilters = {};

    const blockedFilter = currentFilters.value.blockedFilter;
    const deletedFilter = currentFilters.value.deletedFilter;

    // Gestion des filtres bloqué
    if (blockedFilter === "blocked") {
      apiFilters.onlyBlocked = true;
    } else if (blockedFilter === "all") {
      apiFilters.includeBlocked = true;
    }
    // Si "unblocked", on ne fait rien (comportement par défaut de l'API)

    // Gestion des filtres supprimé
    if (deletedFilter === "deleted") {
      apiFilters.onlyDeleted = true;
    } else if (deletedFilter === "all") {
      apiFilters.includeDeleted = true;
    }
    // Si "active", on ne fait rien (comportement par défaut de l'API)

    // Ajouter la recherche
    if (searchQuery.value.trim()) {
      apiFilters.search = searchQuery.value.trim();
    }

    // Ajouter le tri
    if (currentSort.value) {
      apiFilters.sortBy = currentSort.value.column;
      apiFilters.sortOrder = currentSort.value.direction;
    }

    const response = await AdminService.getUsers(apiFilters, {
      page: pagination.value.currentPage,
      limit: pagination.value.itemsPerPage,
    });

    // Mettre à jour les utilisateurs et la pagination
    users.value = response.data;
    const newPagination: PaginationData = {
      currentPage: response.page,
      totalPages: response.totalPages,
      totalItems: response.total,
      itemsPerPage: response.limit,
    };
    pagination.value = newPagination;

    // Sauvegarder en cache
    cache.value.set(cacheKey, {
      data: [...response.data],
      pagination: { ...newPagination },
      timestamp: Date.now(),
    });

    // Note: Le tri et la recherche doivent être gérés côté serveur pour que la pagination fonctionne correctement
    // Pour l'instant, nous gardons les données telles qu'elles arrivent du serveur
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    toast.showToast("error", "Erreur lors du chargement des utilisateurs");
  } finally {
    loading.value = false;
  }
}

async function handleBlockUser(user: User) {
  try {
    await AdminService.blockUser(user.id);
    toast.showToast("success", `L'utilisateur ${user.username} a été bloqué`);
    clearCacheForFilters(); // Vider le cache car les données ont changé
    await loadUsers(true); // Forcer le rafraîchissement
  } catch (error) {
    console.error("Erreur lors du blocage:", error);
    toast.showToast("error", "Erreur lors du blocage de l'utilisateur");
  }
}

async function handleUnblockUser(user: User) {
  try {
    await AdminService.unblockUser(user.id);
    toast.showToast("success", `L'utilisateur ${user.username} a été débloqué`);
    clearCacheForFilters(); // Vider le cache car les données ont changé
    await loadUsers(true); // Forcer le rafraîchissement
  } catch (error) {
    console.error("Erreur lors du déblocage:", error);
    toast.showToast("error", "Erreur lors du déblocage de l'utilisateur");
  }
}

async function handleSeeUser(user: User) {
  router.push(`/admin/users/${user.id}`);
}

// Variable pour le timeout de debounce
let searchTimeout: NodeJS.Timeout | null = null;

function handleSearch(query: string) {
  searchQuery.value = query;

  // Annuler le timeout précédent s'il existe
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Créer un nouveau timeout avec debounce de 500ms
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1; // Reset à la première page
    clearCacheForFilters(); // Vider le cache car les résultats changent
    loadUsers();
  }, 500);
}

function handleFilters(filters: TableFilters) {
  currentFilters.value = {
    blockedFilter: (filters.blockedFilter as BlockedFilterValue) || "",
    deletedFilter: (filters.deletedFilter as DeletedFilterValue) || "",
  };
  pagination.value.currentPage = 1; // Reset à la première page
  clearCacheForFilters(); // Vider le cache car les filtres changent
  loadUsers();
}

function handleSort(sort: TableSort | null) {
  currentSort.value = sort;
  pagination.value.currentPage = 1; // Reset à la première page
  clearCacheForFilters(); // Vider le cache car l'ordre change
  loadUsers();
}

function handlePageChange(page: number) {
  pagination.value.currentPage = page;
  // Ne pas vider le cache pour les changements de page
  loadUsers();
}

function handleItemsPerPageChange(items: number) {
  pagination.value.itemsPerPage = items;
  pagination.value.currentPage = 1; // Reset à la première page
  clearCacheForFilters(); // Vider le cache car la structure change
  loadUsers();
}

// Chargement initial
onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
      <p class="text-gray-600 mt-2">Administrez et gérez les comptes utilisateurs</p>
    </div>

    <DataTable
      :data="users"
      :columns="columns"
      :actions="actions"
      :filters="filters"
      :initial-filters="currentFilters"
      :loading="loading"
      :pagination="pagination"
      :items-per-page-options="itemsPerPageOptions"
      search-placeholder="Rechercher par nom ou email..."
      empty-message="Aucun utilisateur trouvé"
      @update:search="handleSearch"
      @update:filters="handleFilters"
      @update:sort="handleSort"
      @update:page="handlePageChange"
      @update:itemsPerPage="handleItemsPerPageChange"
    />
  </div>
</template>
