<script setup lang="ts">
import { computed, ref } from "vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import Input from "@/components/inputs/InputComponent.vue";
import { ApiService } from "@/services/api.service";
import { useUserStore } from "@/stores/user";
import { useToastStore } from "@/stores/toast";
import { useDialogStore } from "@/stores/dialog";
import { Shield, ShieldCheck, QrCode } from "lucide-vue-next";

const userStore = useUserStore();
const toastStore = useToastStore();
const dialogStore = useDialogStore();

const qrCodeBase64 = ref<string | null>(null);
const totpCode = ref("");
const isLoading = ref(false);
const showQRCode = ref(false);

const is2FAEnabled = computed(() => {
  return Boolean(userStore.user?.TOTPSecret?.secret && userStore.user?.TOTPSecret?.active);
});

const isFormValid = computed(() => {
  return showQRCode.value ? totpCode.value.length === 6 : true;
});

const handleEnable2FA = async () => {
  try {
    isLoading.value = true;
    
    const { data } = await ApiService.post('/auth/totp/enable', {}, true) as { data: { qrCode: string } };
    qrCodeBase64.value = data.qrCode;
    showQRCode.value = true;
    toastStore.showToast("success", "Scannez le code QR avec votre application d'authentification");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'activation de la 2FA";
    toastStore.showToast("error", errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const handleConfirm2FA = async () => {
  if (!isFormValid.value) return;

  try {
    isLoading.value = true;

    await ApiService.post('/auth/totp/enable', { totpCode: totpCode.value }, true);

    // Refresh user data
    await userStore.fetchCurrentUser();
    
    // Reset form
    qrCodeBase64.value = null;
    showQRCode.value = false;
    totpCode.value = "";
    
    toastStore.showToast("success", "Authentification à deux facteurs activée avec succès");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Code de vérification incorrect";
    toastStore.showToast("error", errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const handleDisable2FA = async (confirmed: boolean = false) => {
  confirmed = confirmed || await dialogStore.show({
    title: "Désactiver la 2FA",
    message: "Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ? Cela réduira la sécurité de votre compte.",
    type: "error",
    confirmText: "Oui, désactiver",
    cancelText: "Annuler",
  });

  if (!confirmed) return;

  try {
    isLoading.value = true;
    
    await ApiService.post('/auth/totp/disable', {}, true);
    
    // Refresh user data
    await userStore.fetchCurrentUser();
    
    toastStore.showToast("success", "Authentification à deux facteurs désactivée");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur lors de la désactivation de la 2FA";
    toastStore.showToast("error", errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  qrCodeBase64.value = null;
  showQRCode.value = false;
  totpCode.value = "";
  handleDisable2FA(true)
};
</script>

<template>
  <FormCard>
    <template #title>
      <div class="flex items-center gap-2">
        <component :is="is2FAEnabled ? ShieldCheck : Shield" class="w-5 h-5" :class="is2FAEnabled ? 'text-green-600' : 'text-gray-500'" />
        Authentification à deux facteurs
      </div>
    </template>
    
    <template #content>
      <div class="space-y-6">
        <!-- Status -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <component :is="is2FAEnabled ? ShieldCheck : Shield" class="w-6 h-6" :class="is2FAEnabled ? 'text-green-600' : 'text-gray-500'" />
            <div>
              <p class="font-medium text-gray-900">
                {{ is2FAEnabled ? "2FA activée" : "2FA désactivée" }}
              </p>
              <p class="text-sm text-gray-600">
                {{ is2FAEnabled 
                  ? "Votre compte est sécurisé avec l'authentification à deux facteurs"
                  : "Activez la 2FA pour sécuriser davantage votre compte"
                }}
              </p>
            </div>
          </div>
          <div class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="is2FAEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
              {{ is2FAEnabled ? "Activée" : "Désactivée" }}
            </span>
          </div>
        </div>

        <!-- QR Code Display -->
        <div v-if="showQRCode && qrCodeBase64" class="flex flex-col items-center space-y-4 p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
          <QrCode class="w-6 h-6 text-gray-500" />
          <h3 class="text-lg font-medium text-gray-900">Scannez ce code QR</h3>
          <img :src="qrCodeBase64" alt="QR Code for 2FA" class="w-48 h-48 border rounded-lg shadow-sm">
          <p class="text-sm text-gray-600 text-center max-w-md">
            Utilisez une application d'authentification comme Google Authenticator, Authy, ou Microsoft Authenticator pour scanner ce code QR.
          </p>
          
          <div class="w-full max-w-xs">
            <Input
              v-model="totpCode"
              label="Code de vérification"
              placeholder="123456"
              type="text"
              maxlength="6"
              :disabled="isLoading"
              class="text-center"
            />
            <p class="text-xs text-gray-500 mt-1">Entrez le code à 6 chiffres généré par votre application</p>
          </div>
        </div>

        <!-- Description -->
        <div v-if="!is2FAEnabled && !showQRCode" class="text-sm text-gray-600 space-y-2">
          <p>
            L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
          </p>
          <p>
            Vous aurez besoin d'une application d'authentification sur votre téléphone pour générer des codes de vérification.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <div v-if="!is2FAEnabled && !showQRCode">
            <button
              @click="handleEnable2FA"
              :disabled="isLoading"
              class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? "Activation..." : "Activer la 2FA" }}
            </button>
          </div>

          <div v-if="showQRCode" class="flex gap-3 w-full">
            <button
              @click="handleConfirm2FA"
              :disabled="!isFormValid || isLoading"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? "Vérification..." : "Confirmer l'activation" }}
            </button>
            <button
              @click="handleCancel"
              :disabled="isLoading"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>

          <div v-if="is2FAEnabled">
            <button
              @click="handleDisable2FA"
              :disabled="isLoading"
              class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? "Désactivation..." : "Désactiver la 2FA" }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </FormCard>
</template>