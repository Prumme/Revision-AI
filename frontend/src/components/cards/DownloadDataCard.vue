<script setup lang="ts">
import FormCard from "@/components/forms/cards/FormCard.vue";
import { ApiService } from "@/services/api.service";

const handleDownloadData = async () => {
  const { data } = await ApiService.get("/users/me/data", true);
  //creer un fichier JSON avec les données
  const jsonData = JSON.stringify(data);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
};
</script>

<template>
  <FormCard>
    <template #title> Télécharger mes données </template>
    <template #content>
      <div class="space-y-4">
        <p class="text-gray-600">
          Vous pouvez télécharger une copie de vos données personnelles à tout moment. Le fichier
          contiendra toutes les informations que nous avons sur votre compte.
        </p>
        <button
          @click="handleDownloadData"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Télécharger mes données
        </button>
      </div>
    </template>
  </FormCard>
</template>
