<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";
import Label from "./LabelComponent.vue";

const { modelValue, label, options, placeholder, id } = defineProps<{
  modelValue: string;
  label?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  id: string;
  disabled?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const isFocused = ref(false);

const onSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:modelValue", target.value);
};
</script>

<template>
  <div class="relative">
    <Label v-if="label" :for-id="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </Label>

    <!-- Select input -->
    <div>
      <select
        :id="id"
        :value="modelValue"
        @change="onSelect"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :class="[
          'mt-2 p-2.5 w-full border rounded-md outline-none text-sm text-black placeholder-text-black',
          isFocused ? 'border-primary' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
        ]"
        :disabled="disabled"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="(option, index) in options" :key="index" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>
