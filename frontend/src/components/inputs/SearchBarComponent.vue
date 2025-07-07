<script setup lang="ts">
import { ref, watch } from "vue";
const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();
const emit = defineEmits(["update:modelValue"]);

const input = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => (input.value = v),
);

function onInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}

function onSearchClick() {
  emit("update:modelValue", input.value);
}
</script>

<template>
  <div class="relative w-full">
    <input
      :value="input"
      @input="onInput"
      :placeholder="placeholder || 'Rechercher...'"
      class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md outline-none text-sm text-black focus:border-primary bg-white"
      type="text"
    />
    <button
      type="button"
      class="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400 w-4 h-4 focus:outline-none"
      @click="onSearchClick"
      tabindex="-1"
      aria-label="Rechercher"
    >
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </button>
  </div>
</template>
