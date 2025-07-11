<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { AdminService } from "@/services/admin.service";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { Report } from "@/types/report";

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const report = ref<Report | null>(null);
const loading = ref(true);

async function loadReport() {
  try {
    loading.value = true;
    const response = await AdminService.getReportById(route.params.id as string);
    report.value = response;
  } catch (error) {
    console.error("Erreur lors du chargement du signalement:", error);
    toast.showToast("error", "Erreur lors du chargement du signalement");
  } finally {
    loading.value = false;
  }
}

async function handleResolve() {
  if (!report.value) return;

  try {
    await AdminService.resolveReport(report.value._id);
    toast.showToast("success", "Le signalement a été résolu avec succès");
    await loadReport(); // Recharger les données
  } catch (error) {
    console.error("Erreur lors de la résolution du signalement:", error);
    toast.showToast("error", "Erreur lors de la résolution du signalement");
  }
}

function handleViewTarget() {
  if (!report.value) return;

  if (report.value.type === "quiz") {
    router.push(`/quiz/${report.value.targetId}`);
  } else {
    router.push(`/admin/users/${report.value.targetId}`);
  }
}

onMounted(loadReport);
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Détails du signalement</h1>
      <p class="text-gray-600 mt-2">Consultez et gérez ce signalement</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-3 text-gray-500">Chargement...</span>
    </div>

    <div v-else-if="!report" class="bg-red-100 text-red-800 p-4 rounded-lg">
      Signalement non trouvé
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- En-tête avec statut -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <StatusBadge :variant="report.type === 'user' ? 'warning' : 'info'">
                {{ report.type === "user" ? "Utilisateur" : "Quiz" }}
              </StatusBadge>
              <StatusBadge :variant="report.resolved ? 'success' : 'warning'">
                {{ report.resolved ? "Résolu" : "Non résolu" }}
              </StatusBadge>
            </div>
            <h2 class="text-xl font-semibold text-gray-900">{{ report.targetName }}</h2>
            <p class="text-sm text-gray-500 mt-1">ID: {{ report.targetId }}</p>
          </div>

          <div class="flex gap-3">
            <ButtonComponent variant="outline" @click="handleViewTarget" class="whitespace-nowrap">
              Voir l'élément signalé
            </ButtonComponent>
            <ButtonComponent
              v-if="!report.resolved"
              variant="primary"
              @click="handleResolve"
              class="whitespace-nowrap"
            >
              Marquer comme résolu
            </ButtonComponent>
          </div>
        </div>
      </div>

      <!-- Informations détaillées -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Informations sur le signalement -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Informations</h3>
            <div class="space-y-2">
              <p class="text-sm">
                <span class="font-medium text-gray-700">Signalé par:</span>
                <span class="ml-2">{{ report.reporterName }}</span>
              </p>
              <p class="text-sm">
                <span class="font-medium text-gray-700">Date de signalement:</span>
                <span class="ml-2">{{ new Date(report.createdAt).toLocaleString("fr-FR") }}</span>
              </p>
              <p class="text-sm">
                <span class="font-medium text-gray-700">Dernière mise à jour:</span>
                <span class="ml-2">{{ new Date(report.updatedAt).toLocaleString("fr-FR") }}</span>
              </p>
              <p v-if="report.resolved" class="text-sm">
                <span class="font-medium text-gray-700">Résolu le:</span>
                <span class="ml-2">{{ new Date(report.resolvedAt!).toLocaleString("fr-FR") }}</span>
              </p>
            </div>
          </div>

          <!-- Raisons du signalement -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Raisons du signalement</h3>
            <div class="space-y-4">
              <div
                v-for="(reason, index) in report.reasons"
                :key="index"
                class="bg-gray-50 p-4 rounded-lg"
              >
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-medium text-gray-900">{{ reason.userName }}</p>
                    <p class="text-sm text-gray-500">
                      {{ new Date(reason.createdAt).toLocaleString("fr-FR") }}
                    </p>
                  </div>
                </div>
                <p class="text-gray-700 whitespace-pre-wrap">{{ reason.reason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
