<script setup lang="ts">
import Label from "@/components/inputs/LabelComponent.vue";
import { defineEmits, defineProps } from "vue";

const { modelValue, disabled, label, description } = defineProps<{
  id: string;
  modelValue: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const toggleSwitch = () => {
  if (!disabled) {
    emit("update:modelValue", !modelValue);
  }
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label v-if="label" :for-id="id" class="block !text-xs !font-medium !text-gray-light">
      {{ label }}
    </Label>
    <div class="flex items-center gap-4">
      <div
        class="relative inline-flex items-center cursor-pointer"
        :class="{
          'opacity-50 cursor-not-allowed': disabled,
        }"
        @click="toggleSwitch"
      >
        <span
          :class="[
            'block w-8 h-3 bg-gray-300 border-2 border-gray-light rounded-full transition-all duration-300 ease-in-out',
            {
              'bg-primary': modelValue,
              'bg-white': !modelValue,
            },
          ]"
        ></span>

        <span
          class="absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-4 bg-gray-light rounded-full shadow-md transition-all duration-300 ease-in-out"
          :class="{
            'translate-x-6': modelValue,
            'translate-x-0': !modelValue,
          }"
        ></span>
      </div>

      <p v-if="description" class="text-gray-light/40 text-xs font-outfit">
        {{ description }}
      </p>
    </div>
  </div>
</template>
