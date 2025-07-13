<template>
  <div>
    <div class="border-b border-gray-200 pb-3 flex-shrink-0">
      <h2 class="text-2xl font-extrabold text-zinc-900 m-0">
        {{ user?.blocked ? "Débloquer l'utilisateur" : "Bloquer l'utilisateur" }}
      </h2>
    </div>

    <div class="overflow-y-auto flex-1 min-h-0 py-4">
      <p class="text-base text-zinc-800 leading-relaxed mb-4">
        {{
          user?.blocked
            ? "Êtes-vous sûr de vouloir débloquer cet utilisateur ? Il pourra à nouveau accéder à la plateforme."
            : "Êtes-vous sûr de vouloir bloquer cet utilisateur ? Il ne pourra plus accéder à la plateforme."
        }}
      </p>

      <div v-if="!user?.blocked" class="space-y-2">
        <label for="blockReason" class="block text-sm font-medium text-gray-700">
          Raison du blocage (optionnel)
        </label>
        <textarea
          id="blockReason"
          v-model="blockReason"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          placeholder="Expliquez la raison du blocage..."
        ></textarea>
      </div>
    </div>

    <div class="flex justify-end gap-4 pt-2 border-t border-gray-200 flex-shrink-0">
      <ButtonComponent variant="outline" @click="handleCancel" class="min-w-[120px]">
        Annuler
      </ButtonComponent>
      <ButtonComponent
        :variant="user?.blocked ? 'primary' : 'danger'"
        @click="handleConfirm"
        :disabled="loading"
        class="min-w-[180px]"
      >
        <span v-if="loading" class="inline-flex items-center gap-2">
          <div
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          Traitement...
        </span>
        <span v-else>
          {{ user?.blocked ? "Débloquer" : "Bloquer" }}
        </span>
      </ButtonComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import type { User } from "@/types/user";

interface Props {
  user: User | null;
  loading?: boolean;
}

interface Emits {
  (e: "confirm", reason?: string): void;
  (e: "close"): void;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

const blockReason = ref("");

const handleConfirm = () => {
  emit("confirm", blockReason.value.trim() || undefined);
};

const handleCancel = () => {
  emit("close");
};
</script>
