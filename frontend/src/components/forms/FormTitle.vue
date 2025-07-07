<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import { PencilIcon } from "lucide-vue-next";
import { computed, defineEmits, nextTick, ref, useSlots } from "vue";

const inputRef = ref<HTMLInputElement | null>(null);
const emit = defineEmits(["update:title"]);

const slots = useSlots();
const isEditing = ref(false);
const inputValue = ref("");
const errorMessage = ref("");

// Récupère le contenu du slot (le titre actuel)
const currentTitle = computed(() => (slots.default?.()[0].children ?? "").toString().trim());
const isTitleEmpty = computed(() => currentTitle.value === "Titre du quiz");

const startEditing = () => {
  inputValue.value = currentTitle.value;
  isEditing.value = true;
  nextTick(() => inputRef.value?.focus());
};

const saveTitle = () => {
  if (inputValue.value.trim() === "") {
    errorMessage.value = "Le titre ne peut pas être vide.";
    return;
  }

  emit("update:title", inputValue.value);
  isEditing.value = false;
  errorMessage.value = "";
};
</script>

<template>
  <div class="flex items-center gap-5">
    <template v-if="isEditing">
      <input
        v-model="inputValue"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        class="text-4xl font-extrabold text-black border-b border-gray-300 focus:outline-none"
      />
    </template>
    <template v-else>
      <h1
        class="font-outfit text-4xl font-extrabold"
        :class="{
          'text-gray-400 animate-pulse': isTitleEmpty,
          'text-black': !isTitleEmpty,
        }"
      >
        <slot></slot>
      </h1>
    </template>

    <Button size="icon" variant="rounded-full" @click="startEditing">
      <PencilIcon class="h-5 w-5 text-black" />
    </Button>

    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
  </div>
</template>
