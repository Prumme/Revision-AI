<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { useDialogStore } from "@/stores/dialog";
import { AdminService } from "@/services/admin.service";
import { getUserInvoices } from "@/services/user.service";

import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { UserX, AtSign } from "lucide-vue-next";

import UserPersonalInfo from "@/components/admin/UserPersonalInfo.vue";
import UserBillingInfo from "@/components/admin/UserBillingInfo.vue";
import UserQuizzes from "@/components/admin/UserQuizzes.vue";
import UserDocuments from "@/components/admin/UserDocuments.vue";

import type { User as UserType } from "@/types/user";
import type { Quiz } from "@/types/quiz";
import type { Invoice } from "@/types/invoice";

const route = useRoute();
const toast = useToastStore();
const dialog = useDialogStore();

// État
const user = ref<UserType | null>(null);
const loading = ref(false);
const userQuizzes = ref<Quiz[]>([]);

const userInvoices = ref<Invoice[]>([]);
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
    const [userResponse, quizzesData] = await Promise.allSettled([
      AdminService.getUserById(userId.value),
      AdminService.getUserQuizzes(userId.value),
    ]);

    // Traiter les résultats
    if (userResponse.status === "fulfilled") {
      user.value = userResponse.value;
      if (user.value.customerId) {
        userInvoices.value = await getUserInvoices(user.value.customerId);
      }
    } else {
      throw new Error("Utilisateur non trouvé");
    }

    userQuizzes.value = quizzesData.status === "fulfilled" ? quizzesData.value.data : [];
  } catch (error) {
    console.error("Erreur lors du chargement des détails utilisateur:", error);
    toast.showToast("error", "Impossible de charger les détails de l'utilisateur");
  } finally {
    loading.value = false;
  }
};

const handleBlockUser = async () => {
  if (!user.value) return;

  const result = await dialog.showBlockUser({
    user: user.value,
    loading: actionLoading.value,
  });

  if (!result) return;

  try {
    actionLoading.value = true;

    if (user.value.blocked) {
      await AdminService.unblockUser(user.value._id);
      toast.showToast("success", "Utilisateur débloqué avec succès");
    } else {
      const reason = typeof result === "string" ? result : "spam";
      await AdminService.blockUser(user.value._id, reason);
      toast.showToast("success", "Utilisateur bloqué avec succès");
    }

    await fetchUserDetails();
  } catch (error) {
    console.error("Erreur lors du blocage/déblocage:", error);
    toast.showToast("error", "Impossible de modifier le statut de l'utilisateur");
  } finally {
    actionLoading.value = false;
  }
};

const handleUsernameChange = async () => {
  if (!user.value) return;

  const confirmed = await dialog.show({
    title: "Demander un changement de nom d'utilisateur",
    message:
      "Êtes-vous sûr de vouloir demander à cet utilisateur de changer son nom d'utilisateur ?",
    confirmText: "Envoyer",
    cancelText: "Annuler",
    type: "info",
  });

  if (!confirmed) return;

  try {
    actionLoading.value = true;

    await AdminService.askNewUsername(user.value._id);

    toast.showToast("success", "Demande de changement de nom d'utilisateur envoyée");

    // Mettre à jour l'utilisateur
    await fetchUserDetails();
  } catch (error) {
    console.error("Erreur lors de la demande de changement de nom d'utilisateur:", error);
    toast.showToast("error", "Impossible d'envoyer la demande de changement de nom d'utilisateur");
  } finally {
    actionLoading.value = false;
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
              variant="primary"
              :disabled="actionLoading"
              tooltip="Envoyer un email pour demander un changement de nom d'utilisateur"
              @click="handleUsernameChange"
            >
              <AtSign class="w-4 h-4 mr-2" />
              Nouveau pseudo
            </ButtonComponent>

            <ButtonComponent
              :variant="user?.blocked ? 'danger' : 'danger'"
              :disabled="actionLoading"
              :tooltip="user?.blocked ? 'Débloquer l\'utilisateur' : 'Bloquer l\'utilisateur'"
              @click="handleBlockUser"
            >
              <UserX class="w-4 h-4 mr-2" />
              {{ user?.blocked ? "Débloquer" : "Bloquer" }}
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
        <UserQuizzes class="col-span-2" :quizzes="userQuizzes" />
        <UserDocuments class="col-span-2" :user-id="userId" />
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-8">
        <p class="text-gray-500">Utilisateur non trouvé</p>
      </div>
    </div>

    <!-- Dialog de confirmation global -->
    <ConfirmDialog />
  </div>
</template>
