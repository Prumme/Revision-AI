<script setup lang="ts">
import { User } from "lucide-vue-next";
import CardComponent from "@/components/cards/CardComponent.vue";
import StatusBadge from "@/components/badges/StatusBadge.vue";
import type { User as UserType } from "@/types/user";

defineProps<{
  user: UserType;
}>();
</script>

<template>
  <CardComponent>
    <template #header>
      <div class="flex items-center gap-2">
        <User class="w-5 h-5 text-primary" />
        <h2 class="text-xl font-semibold text-gray-900">Informations Personnelles</h2>
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-10 gap-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Nom d'utilisateur</label>
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
          <label class="block text-sm font-medium text-gray-500 mb-1">Dernière mise à jour</label>
          <p class="text-gray-900">
            {{ user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "-" }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1"
            >Dernière demande de changement de nom d'utilisateur</label
          >
          <p class="text-gray-900">
            {{
              user.lastModifiedUsernameAsked
                ? new Date(user.lastModifiedUsernameAsked).toLocaleDateString("fr-FR")
                : "Jamais"
            }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1"
            >Dernière modification du mot de passe</label
          >
          <p class="text-gray-900">
            {{
              user.lastUpdatedPassword
                ? new Date(user.lastUpdatedPassword).toLocaleDateString("fr-FR")
                : "Jamais"
            }}
          </p>
        </div>
      </div>
    </template>
  </CardComponent>
</template>
