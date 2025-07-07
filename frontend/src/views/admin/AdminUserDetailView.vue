<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { AdminService } from "@/services/admin.service";

import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { UserX, Send } from "lucide-vue-next";

import UserPersonalInfo from "@/components/admin/UserPersonalInfo.vue";
import UserBillingInfo from "@/components/admin/UserBillingInfo.vue";
import UserQuizzes from "@/components/admin/UserQuizzes.vue";
import UserDocuments from "@/components/admin/UserDocuments.vue";

import type { User as UserType } from "@/types/user";
import type { Quiz } from "@/types/quiz";
import type { Document } from "@/types/document";
import type { Invoice } from "@/types/invoice";

const route = useRoute();
const toast = useToastStore();

// État
const user = ref<UserType | null>(null);
const loading = ref(false);
const userQuizzes = ref<Quiz[]>([]);
const userDocuments = ref<Document[]>([]);
const userInvoices = ref<Invoice[]>([]);
const showBlockDialog = ref(false);
const showPasswordResetDialog = ref(false);
const actionLoading = ref(false);

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
      if (user.value.customerId) {
        const invoicesResponse = await AdminService.getUserInvoices(user.value.customerId);
        userInvoices.value = invoicesResponse;
      }
    } else {
      throw new Error("Utilisateur non trouvé");
    }

    // userQuizzes.value = quizzesData.status === "fulfilled" ? quizzesData.value : [];
    // userDocuments.value = documentsData.status === "fulfilled" ? documentsData.value : [];
  } catch (error) {
    console.error("Erreur lors du chargement des détails utilisateur:", error);
    toast.showToast("error", "Impossible de charger les détails de l'utilisateur");
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
      toast.showToast("success", "Utilisateur débloqué avec succès");
    } else {
      await AdminService.blockUser(user.value.id);
      toast.showToast("success", "Utilisateur bloqué avec succès");
    }

    await fetchUserDetails();
  } catch (error) {
    console.error("Erreur lors du blocage/déblocage:", error);
    toast.showToast("error", "Impossible de modifier le statut de l'utilisateur");
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

    toast.showToast("success", "Demande de réinitialisation de mot de passe envoyée");
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    toast.showToast("error", "Impossible d'envoyer la demande de réinitialisation");
  } finally {
    actionLoading.value = false;
    showPasswordResetDialog.value = false;
  }
};

const handleSubscriptionUpdate = (newTier: string) => {
  if (user.value) {
    user.value.subscriptionTier = newTier;
  }
};

// Hooks
onMounted(() => {
  fetchUserDetails();
});
</script>

<template>
  <div class="min-h-screen p-4">
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
          <span class="text-sm text-gray-500"> ID: {{ user._id }} </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Content -->
      <div v-else-if="user" class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <UserPersonalInfo :user="user" />
        <UserBillingInfo
          :user="user"
          :invoices="userInvoices"
          @refresh="handleSubscriptionUpdate"
        />
        <UserQuizzes :quizzes="userQuizzes" />
        <UserDocuments :documents="userDocuments" />
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
