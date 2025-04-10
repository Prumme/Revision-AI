<script setup lang="ts">
import { CheckCircleIcon, EyeIcon, EyeOffIcon, XCircleIcon } from "lucide-vue-next";
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import LabelComponent from "./LabelComponent.vue";

const props = defineProps({
  modelValue: { type: String, required: true },
  label: { type: String, required: false },
  placeholder: { type: String, required: false },
  type: { type: String, default: "text" },
  autocomplete: { type: String, required: false },
  showCriteria: { type: Boolean, default: true },
  id: {
    type: String,
    required: false,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  },
});

const emit = defineEmits(["update:modelValue"]);

const passwordVisible = ref(false);
const isFocused = ref(false);

const inputType = computed(() =>
  props.type === "password" && passwordVisible.value ? "text" : props.type,
);

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

watch(
  () => props.type,
  (newType) => {
    if (newType !== "password") passwordVisible.value = false;
  },
);

// Validation logic for password
const password = computed(() => props.modelValue);

const isLengthValid = computed(() => password.value.length >= 12);
const hasLetters = computed(() => /[a-zA-Z]/.test(password.value));
const hasNumbers = computed(() => /\d/.test(password.value));
const hasSymbols = computed(() => /[^a-zA-Z0-9]/.test(password.value));
</script>

<template>
  <div class="relative">
    <LabelComponent v-if="label" :for-id="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </LabelComponent>

    <!-- Password input -->
    <div class="flex flex-col gap-2">
      <div
        v-if="type === 'password'"
        :class="[
          'flex items-center justify-between mt-2 w-full border rounded-md',
          isFocused ? 'border-primary' : 'border-gray-300',
        ]"
      >
        <input
          :id="id"
          :type="inputType"
          :value="modelValue"
          @input="onInput"
          @focus="isFocused = true"
          @blur="isFocused = false"
          class="p-2 w-full flex-1 outline-none bg-transparent text-sm text-black"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
        />

        <button
          type="button"
          @click="togglePasswordVisibility"
          class="text-gray-500 hover:text-gray-700 focus:outline-none p-1 mr-2"
        >
          <EyeIcon v-if="passwordVisible" class="w-4 h-4 text-primary" />
          <EyeOffIcon v-else class="w-4 h-4 text-primary" />
        </button>
      </div>

      <!-- Password criterias -->
      <div
        v-if="type === 'password' && showCriteria"
        class="mt-1 grid grid-cols-2 gap-2 text-[10px]"
      >
        <div class="flex items-center gap-2">
          <CheckCircleIcon v-if="isLengthValid" class="w-3 h-3 lg:w-5 lg:h-5 text-green-500" />
          <XCircleIcon v-else class="w-3 h-3 lg:w-5 lg:h-5 text-error" />
          <span :class="isLengthValid ? 'text-success' : 'text-error'">
            Minimum 12 caractères
          </span>
        </div>
        <div class="flex items-center gap-2">
          <CheckCircleIcon v-if="hasLetters" class="w-3 h-3 lg:w-5 lg:h-5 text-success" />
          <XCircleIcon v-else class="w-3 h-3 lg:w-5 lg:h-5 text-error" />
          <span :class="hasLetters ? 'text-success' : 'text-error'"> Contient des lettres </span>
        </div>
        <div class="flex items-center gap-2">
          <CheckCircleIcon v-if="hasNumbers" class="w-3 h-3 lg:w-5 lg:h-5 text-success" />
          <XCircleIcon v-else class="w-3 h-3 lg:w-5 lg:h-5 text-error" />
          <span :class="hasNumbers ? 'text-success' : 'text-error'"> Contient des chiffres </span>
        </div>
        <div class="flex items-center gap-2">
          <CheckCircleIcon v-if="hasSymbols" class="w-3 h-3 lg:w-5 lg:h-5 text-success" />
          <XCircleIcon v-else class="w-3 h-3 lg:w-5 lg:h-5 text-error" />
          <span :class="hasSymbols ? 'text-success' : 'text-error'"> Contient des symboles </span>
        </div>
      </div>
    </div>

    <!-- Basic input (non-password) -->
    <input
      v-if="type !== 'password'"
      :id="id"
      :type="type"
      :value="modelValue"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :class="[
        'mt-2 p-2 w-full border rounded-md outline-none text-sm text-black',
        isFocused ? 'border-primary' : 'border-gray-300',
      ]"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
    />
  </div>
</template>

