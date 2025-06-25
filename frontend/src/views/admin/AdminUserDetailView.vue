<script setup lang="ts">
import { ref, onMounted, computed, h } from "vue";
import { useRoute } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { AdminService } from "@/services/admin.service";

import CardComponent from "@/components/cards/CardComponent.vue";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import DataTable from "@/components/tables/DataTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { User, CreditCard, FileText, UserX, Mail, Send } from "lucide-vue-next";
import type { User as UserType } from "@/types/user";
import type { Quiz } from "@/types/quiz";
import type { Document } from "@/types/document";
import type { TableColumn } from "@/types/datatable";

const route = useRoute();
const toast = useToastStore();

// État
const user = ref<UserType | null>(null);
const loading = ref(false);
const userQuizzes = ref<Quiz[]>([]);
const userDocuments = ref<Document[]>([]);
const showBlockDialog = ref(false);
const showPasswordResetDialog = ref(false);
const actionLoading = ref(false);

// Configuration des colonnes pour les quiz
const quizColumns: TableColumn[] = [
  {
    key: "title",
    label: "Titre du Quiz",
    sortable: true,
  },
  {
    key: "questionsCount",
    label: "Nb. Questions",
    sortable: true,
  },
  {
    key: "status",
    label: "Statut",
    render: (value: string) =>
      h(
        StatusBadge,
        {
          variant: value === "published" ? "success" : value === "draft" ? "warning" : "secondary",
        },
        () => (value === "published" ? "Publié" : value === "draft" ? "Brouillon" : "Archivé"),
      ),
  },
  {
    key: "createdAt",
    label: "Date de création",
    sortable: true,
    formatter: (value: string) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-"),
  },
];

// Configuration des colonnes pour les documents
const documentColumns: TableColumn[] = [
  {
    key: "filename",
    label: "Nom du fichier",
    sortable: true,
  },
  {
    key: "fileSize",
    label: "Taille",
    formatter: (value: number) => {
      if (!value) return "-";
      const mb = value / (1024 * 1024);
      return `${mb.toFixed(2)} MB`;
    },
  },
  {
    key: "fileType",
    label: "Type",
    render: (value: string) =>
      h(
        StatusBadge,
        {
          variant: value === "pdf" ? "info" : value === "image" ? "secondary" : "warning",
        },
        () => value.toUpperCase(),
      ),
  },
  {
    key: "uploadedAt",
    label: "Date d'upload",
    sortable: true,
    formatter: (value: string) => (value ? new Date(value).toLocaleDateString("fr-FR") : "-"),
  },
];

// Computed
const userId = computed(() => route.params.id as string);

const userStatusVariant = computed(() => {
  if (!user.value) return "secondary";
  if (user.value.deleted) return "secondary";
  if (user.value.blocked) return "danger";
  if (user.value.emailVerified) return "success";
  return "secondary";
});

const userStatusText = computed(() => {
  if (!user.value) return "Inconnu";
  if (user.value.deleted) return "Supprimé";
  if (user.value.blocked) return "Bloqué";
  if (user.value.emailVerified) return "Email vérifié";
  return "Email non vérifié";
});

// Fonctions
const fetchUserDetails = async () => {
  try {
    loading.value = true;

    // Récupérer toutes les données en parallèle
    const [
      userResponse,
      //  quizzesData,
      //  documentsData
    ] = await Promise.allSettled([
      AdminService.getUserById(userId.value),
      //   AdminService.getUserQuizzes(userId.value),
      //   AdminService.getUserDocuments(userId.value),
    ]);

    // Traiter les résultats
    if (userResponse.status === "fulfilled") {
      user.value = userResponse.value;
      console.log(user.value);
    } else {
      throw new Error("Utilisateur non trouvé");
    }

    userQuizzes.value = quizzesData.status === "fulfilled" ? quizzesData.value : [];
    userDocuments.value = documentsData.status === "fulfilled" ? documentsData.value : [];
  } catch (error) {
    console.error("Erreur lors du chargement des détails utilisateur:", error);
    toast.addToast({
      type: "error",
      title: "Erreur",
      message: "Impossible de charger les détails de l'utilisateur",
    });
  } finally {
    loading.value = false;
  }
};

const handleBlockUser = async () => {
  if (!user.value) return;

  try {
    actionLoading.value = true;

    if (user.value.blocked) {
      await AdminService.unblockUser(user.value.id);
      toast.addToast({
        type: "success",
        title: "Succès",
        message: "Utilisateur débloqué avec succès",
      });
    } else {
      await AdminService.blockUser(user.value.id);
      toast.addToast({
        type: "success",
        title: "Succès",
        message: "Utilisateur bloqué avec succès",
      });
    }

    await fetchUserDetails();
  } catch (error) {
    console.error("Erreur lors du blocage/déblocage:", error);
    toast.addToast({
      type: "error",
      title: "Erreur",
      message: "Impossible de modifier le statut de l'utilisateur",
    });
  } finally {
    actionLoading.value = false;
    showBlockDialog.value = false;
  }
};

const handlePasswordReset = async () => {
  if (!user.value) return;

  try {
    actionLoading.value = true;

    await AdminService.requestPasswordReset(user.value.id);

    toast.addToast({
      type: "success",
      title: "Succès",
      message: "Demande de réinitialisation de mot de passe envoyée",
    });
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    toast.addToast({
      type: "error",
      title: "Erreur",
      message: "Impossible d'envoyer la demande de réinitialisation",
    });
  } finally {
    actionLoading.value = false;
    showPasswordResetDialog.value = false;
  }
};

// Hooks
onMounted(() => {
  fetchUserDetails();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div v-if="!loading" class="mb-6">
        <div class="flex items-center justify-between gap-4 mb-4">
          <h1 class="text-2xl text-gray-900 text-nowrap">
            Gestion de l'utilisateur
            <span class="text-primary font-bold">{{ user?.username || "" }}</span>
          </h1>
          <div class="flex items-center gap-2">
            <ButtonComponent
              :variant="user?.blocked ? 'danger' : 'danger'"
              :disabled="actionLoading"
              size="icon"
              :tooltip="user?.blocked ? 'Débloquer l\'utilisateur' : 'Bloquer l\'utilisateur'"
              @click="showBlockDialog = true"
            >
              <UserX class="w-4 h-4" />
            </ButtonComponent>

            <ButtonComponent
              variant="primary"
              :disabled="actionLoading"
              size="icon"
              tooltip="Envoyer une demande de réinitialisation de mot de passe"
              @click="showPasswordResetDialog = true"
            >
              <Send class="w-4 h-4" />
            </ButtonComponent>
          </div>
        </div>

        <div v-if="user" class="flex items-center gap-2">
          <StatusBadge :variant="userStatusVariant">
            {{ userStatusText }}
          </StatusBadge>
          <span class="text-sm text-gray-500"> ID: {{ user.id }} </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Content -->
      <div v-else-if="user" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <!-- Actions Administrateur -->

        <!-- Informations Personnelles -->
        <CardComponent>
          <template #header>
            <div class="flex items-center gap-2 mb-4">
              <User class="w-5 h-5 text-primary" />
              <h2 class="text-xl font-semibold text-gray-900">Informations Personnelles</h2>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-10 gap-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >Nom d'utilisateur</label
                >
                <p class="text-gray-900">{{ user.username }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p class="text-gray-900">{{ user.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
                <StatusBadge :variant="user.role === 'admin' ? 'info' : 'secondary'">
                  {{ user.role === "admin" ? "Administrateur" : "Utilisateur" }}
                </StatusBadge>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Email vérifié</label>
                <StatusBadge :variant="user.emailVerified ? 'success' : 'warning'">
                  {{ user.emailVerified ? "Vérifié" : "Non vérifié" }}
                </StatusBadge>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
                <p class="text-gray-900">
                  {{ user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "-" }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >Dernière mise à jour</label
                >
                <p class="text-gray-900">
                  {{ user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "-" }}
                </p>
              </div>
              <div v-if="user.bio" class="md:col-span-2 lg:col-span-3">
                <label class="block text-sm font-medium text-gray-500 mb-1">Biographie</label>
                <p class="text-gray-900">{{ user.bio }}</p>
              </div>
            </div>
          </template>
        </CardComponent>

        <!-- Informations de Facturation -->
        <CardComponent>
          <template #header>
            <div class="flex items-center gap-2 mb-4">
              <CreditCard class="w-5 h-5 text-primary" />
              <h2 class="text-xl font-semibold text-gray-900">Informations de Facturation</h2>
            </div>
          </template>
          <template #content>
            <div
              v-if="user.subscriptionTier || user.customerId || user.firstName || user.address"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >Plan d'abonnement</label
                >
                <StatusBadge
                  :variant="user.subscriptionTier === 'premium' ? 'success' : 'secondary'"
                >
                  {{ user.subscriptionTier === "premium" ? "Premium" : "Gratuit" }}
                </StatusBadge>
              </div>
              <div v-if="user.customerId">
                <label class="block text-sm font-medium text-gray-500 mb-1">ID Client Stripe</label>
                <p class="text-gray-900 font-mono text-sm">{{ user.customerId }}</p>
              </div>
              <div v-if="user.firstName || user.lastName">
                <label class="block text-sm font-medium text-gray-500 mb-1">Nom complet</label>
                <p class="text-gray-900">
                  {{ [user.firstName, user.lastName].filter(Boolean).join(" ") || "-" }}
                </p>
              </div>
              <div v-if="user.address" class="md:col-span-2 lg:col-span-3">
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >Adresse de facturation</label
                >
                <div class="text-gray-900">
                  <p v-if="user.address.street">{{ user.address.street }}</p>
                  <p v-if="user.address.city || user.address.postalCode">
                    {{ [user.address.postalCode, user.address.city].filter(Boolean).join(" ") }}
                  </p>
                  <p v-if="user.address.country">{{ user.address.country }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <CreditCard class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune information de facturation disponible</p>
            </div>
          </template>
        </CardComponent>

        <!-- Quiz Générés -->
        <CardComponent>
          <template #header>
            <div class="flex items-center gap-2 mb-4">
              <FileText class="w-5 h-5 text-primary" />
              <h2 class="text-xl font-semibold text-gray-900">
                Quiz Générés ({{ userQuizzes.length }})
              </h2>
            </div>
          </template>
          <template #content>
            <DataTable
              v-if="userQuizzes.length > 0"
              :data="userQuizzes"
              :columns="quizColumns"
              :searchable="true"
              search-placeholder="Rechercher un quiz..."
              empty-message="Aucun quiz trouvé"
              row-key="id"
            />
            <div v-else class="text-center py-8 text-gray-500">
              <FileText class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun quiz généré par cet utilisateur</p>
            </div>
          </template>
        </CardComponent>

        <!-- Documents Uploadés -->
        <CardComponent>
          <template #header>
            <div class="flex items-center gap-2 mb-4">
              <Mail class="w-5 h-5 text-primary" />
              <h2 class="text-xl font-semibold text-gray-900">
                Documents Uploadés ({{ userDocuments.length }})
              </h2>
            </div>
          </template>
          <template #content>
            <DataTable
              v-if="userDocuments.length > 0"
              :data="userDocuments"
              :columns="documentColumns"
              :searchable="true"
              search-placeholder="Rechercher un document..."
              empty-message="Aucun document trouvé"
              row-key="id"
            />
            <div v-else class="text-center py-8 text-gray-500">
              <Mail class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun document uploadé par cet utilisateur</p>
            </div>
          </template>
        </CardComponent>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-8">
        <p class="text-gray-500">Utilisateur non trouvé</p>
      </div>
    </div>

    <!-- Dialog de confirmation pour le blocage -->
    <ConfirmDialog
      v-model="showBlockDialog"
      :title="user?.blocked ? 'Débloquer l\'utilisateur' : 'Bloquer l\'utilisateur'"
      :message="
        user?.blocked
          ? 'Êtes-vous sûr de vouloir débloquer cet utilisateur ? Il pourra à nouveau accéder à la plateforme.'
          : 'Êtes-vous sûr de vouloir bloquer cet utilisateur ? Il ne pourra plus accéder à la plateforme.'
      "
      :confirm-text="user?.blocked ? 'Débloquer' : 'Bloquer'"
      :confirm-variant="user?.blocked ? 'primary' : 'danger'"
      :loading="actionLoading"
      @confirm="handleBlockUser"
      @cancel="showBlockDialog = false"
    />

    <!-- Dialog de confirmation pour la réinitialisation du mot de passe -->
    <ConfirmDialog
      v-model="showPasswordResetDialog"
      title="Réinitialiser le mot de passe"
      message="Êtes-vous sûr de vouloir envoyer une demande de réinitialisation de mot de passe à cet utilisateur ?"
      confirm-text="Envoyer"
      confirm-variant="primary"
      :loading="actionLoading"
      @confirm="handlePasswordReset"
      @cancel="showPasswordResetDialog = false"
    />
  </div>
</template>
