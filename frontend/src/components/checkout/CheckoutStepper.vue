<script setup lang="ts">
import { CheckIcon, ChevronRightIcon } from "lucide-vue-next";

interface StepperStep {
  id: string;
  label: string;
  isCurrent: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
}

interface Props {
  steps: StepperStep[];
  currentStepIndex: number;
  progressPercentage?: number;
}

defineProps<Props>();
const emit = defineEmits<{
  goToStep: [stepIndex: number];
}>();

const handleStepClick = (stepIndex: number, step: StepperStep) => {
  if (step.isAccessible) {
    emit("goToStep", stepIndex);
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <!-- Steps only, progression supprimée -->
    <nav class="flex items-center gap-4">
      <template v-for="(step, index) in steps" :key="step.id">
        <button
          class="flex items-center gap-2 font-outfit text-base"
          :class="{
            'text-primary font-bold': step.isCurrent,
            'text-gray-400': !step.isAccessible && !step.isCurrent,
            'cursor-pointer': step.isAccessible,
            'cursor-not-allowed': !step.isAccessible,
          }"
          :disabled="!step.isAccessible"
          @click="handleStepClick(index, step)"
        >
          <span
            v-if="step.isCompleted"
            class="inline-flex items-center justify-center w-5 h-5 bg-primary text-white rounded-full mr-2"
          >
            <CheckIcon class="w-4 h-4" />
          </span>
          <span
            v-else
            class="inline-flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full mr-2"
          >
            {{ index + 1 }}
          </span>
          {{ step.label }}
        </button>
        <ChevronRightIcon v-if="index < steps.length - 1" class="w-4 h-4 text-gray-300" />
      </template>
    </nav>
  </div>
</template>
