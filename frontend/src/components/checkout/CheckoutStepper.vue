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
  progressPercentage: number;
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
    <!-- Progress bar -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="font-outfit text-sm text-gray-600">Progression</span>
        <span class="font-outfit text-sm font-semibold text-primary">
          {{ progressPercentage }}%
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Desktop Stepper (horizontal) -->
    <div class="hidden md:block">
      <nav aria-label="Progress">
        <ol class="flex items-center">
          <li
            v-for="(step, stepIndex) in steps"
            :key="step.id"
            :class="[stepIndex !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative']"
          >
            <!-- Connector line -->
            <div
              v-if="stepIndex !== steps.length - 1"
              class="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div class="h-0.5 w-full bg-gray-200">
                <div
                  v-if="step.isCompleted"
                  class="h-0.5 bg-primary transition-all duration-300"
                  style="width: 100%"
                ></div>
              </div>
            </div>

            <!-- Step button -->
            <button
              @click="handleStepClick(stepIndex, step)"
              :disabled="!step.isAccessible"
              class="relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200"
              :class="[
                step.isCurrent
                  ? 'border-primary bg-primary text-white'
                  : step.isCompleted
                    ? 'border-primary bg-primary text-white'
                    : step.isAccessible
                      ? 'border-gray-300 bg-white text-gray-500 hover:border-primary hover:text-primary'
                      : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed',
              ]"
            >
              <CheckIcon
                v-if="step.isCompleted && !step.isCurrent"
                class="h-5 w-5"
                aria-hidden="true"
              />
              <span v-else class="font-outfit font-medium text-sm">{{ stepIndex + 1 }}</span>
            </button>

            <!-- Step label -->
            <div class="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span
                class="font-outfit text-sm font-medium"
                :class="[
                  step.isCurrent
                    ? 'text-primary'
                    : step.isCompleted
                      ? 'text-green-600'
                      : step.isAccessible
                        ? 'text-gray-700'
                        : 'text-gray-400',
                ]"
              >
                {{ step.label }}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>

    <!-- Mobile Stepper (vertical) -->
    <div class="md:hidden">
      <nav aria-label="Progress">
        <ol class="space-y-4">
          <li v-for="(step, stepIndex) in steps" :key="step.id" class="flex items-center">
            <!-- Step button -->
            <button
              @click="handleStepClick(stepIndex, step)"
              :disabled="!step.isAccessible"
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 mr-3"
              :class="[
                step.isCurrent
                  ? 'border-primary bg-primary text-white'
                  : step.isCompleted
                    ? 'border-primary bg-primary text-white'
                    : step.isAccessible
                      ? 'border-gray-300 bg-white text-gray-500'
                      : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed',
              ]"
            >
              <CheckIcon
                v-if="step.isCompleted && !step.isCurrent"
                class="h-4 w-4"
                aria-hidden="true"
              />
              <span v-else class="font-outfit font-medium text-xs">{{ stepIndex + 1 }}</span>
            </button>

            <!-- Step content -->
            <div class="flex-1">
              <span
                class="font-outfit text-sm font-medium"
                :class="[
                  step.isCurrent
                    ? 'text-primary'
                    : step.isCompleted
                      ? 'text-green-600'
                      : step.isAccessible
                        ? 'text-gray-700'
                        : 'text-gray-400',
                ]"
              >
                {{ step.label }}
              </span>
            </div>

            <!-- Current step indicator -->
            <ChevronRightIcon
              v-if="step.isCurrent"
              class="h-4 w-4 text-primary ml-2"
              aria-hidden="true"
            />
          </li>
        </ol>
      </nav>
    </div>
  </div>
</template>
