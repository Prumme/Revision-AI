<script setup lang="ts">
import Callout from "@/components/callouts/CalloutComponent.vue";
import QuestionDraggable from "@/components/draggables/QuestionDraggable.vue";
import Dropzone from "@/components/dropzone/DropzoneComponent.vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import FormHeader from "@/components/forms/FormHeader.vue";
import Input from "@/components/inputs/InputComponent.vue";
import Select from "@/components/inputs/SelectComponent.vue";
import Switch from "@/components/inputs/SwitchComponent.vue";
import ToastComponent from "@/components/toasts/ToastComponent.vue";
import { BadgeInfoIcon, OctagonAlertIcon, XCircleIcon } from "lucide-vue-next";
import { ref } from "vue";

const isChecked = ref(false);
const options = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
  { label: "Option 4", value: "4" },
  { label: "Option 5", value: "5" },
];

const category = ref("");
const description = ref("");
const questionsNumbers = ref(0);

const questions = ref([
  {
    question: "Quand est né Louis XIV ?",
    choices: [
      { choice: "En 1876", good: false },
      { choice: "En 1912", good: false },
      { choice: "En 1638", good: true },
    ],
  },
  {
    question: "Qui a écrit l'ouvrage 'De l'esprit des lois' ?",
    choices: [
      { choice: "Montesquieu", good: true },
      { choice: "Rousseau", good: false },
      { choice: "Voltaire", good: false },
    ],
  },
  {
    question: "En quelle année a eu lieu la Révolution française ?",
    choices: [
      { choice: "1789", good: true },
      { choice: "1799", good: false },
      { choice: "1804", good: false },
    ],
  },
  {
    question: "Qui était le premier empereur de Rome ?",
    choices: [
      { choice: "Jules César", good: false },
      { choice: "Augustus", good: true },
      { choice: "Néron", good: false },
    ],
  },
  {
    question: "Quel était le nom du Titanic ?",
    choices: [
      { choice: "RMS Titanic", good: true },
      { choice: "HMS Titanic", good: false },
      { choice: "SS Titanic", good: false },
    ],
  },
]);
</script>

<template>
  <div class="flex flex-col gap-12 w-full">
    <ToastComponent type="error" message="Ceci est un message d'erreur" class="mb-5" />
  </div>

  <section class="flex flex-col gap-5 p-4 w-full">
    <FormHeader title="Titre de votre quiz" description="Créez votre quiz" />

    <!-- Grille des questions -->
    <QuestionDraggable :questions="questions" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Callout
        variant="info"
        :icon="BadgeInfoIcon"
        message="Mettez tous les fichiers et images sur lesquels vous voulez vous auto-évaluer"
      />
      <Callout
        variant="default"
        message="Mettez tous les fichiers et images sur lesquels vous voulez vous auto-évaluer"
      />
      <Callout
        variant="warning"
        :icon="OctagonAlertIcon"
        message="Mettez tous les fichiers et images sur lesquels vous voulez vous auto-évaluer"
      />
      <Callout
        variant="error"
        :icon="XCircleIcon"
        message="Mettez tous les fichiers et images sur lesquels vous voulez vous auto-évaluer"
      />
      <FormCard>
        <template #title> Informations générales </template>
        <template #content>
          <section class="grid grid-cols-2 gap-2 space-y-5">
            <Select
              id="categorySelect"
              v-model="category"
              label="Categorie"
              :options="options"
              placeholder="Sélectionnez une categorie"
            />
            <Input
              id="questionsNumbers"
              v-model="questionsNumbers"
              label="Nombres de questions"
              type="number"
              placeholder="Nombre de questions"
              class="col-span-1"
            />
          </section>
          <Input
            id="description"
            v-model="description"
            label="Description"
            type="textarea"
            placeholder="Description du quiz"
            class="col-span-1"
          />
          <div class="flex items-center gap-2">
            <Switch
              id="visibility"
              label="Visibilité du quiz"
              placeholder="Titre du quiz"
              description="Un quiz publique est accessible pour les autres quizzers"
              :modelValue="isChecked"
              @update:modelValue="isChecked = $event"
              class="mt-2"
            />
          </div>
        </template>
      </FormCard>
      <FormCard>
        <template #title> Images </template>
        <template #content>
          <Dropzone class="mb-5" :multiple="false" variant="yellow" />
          <Dropzone :multiple="false" />
        </template>
      </FormCard>
    </div>
  </section>
</template>
