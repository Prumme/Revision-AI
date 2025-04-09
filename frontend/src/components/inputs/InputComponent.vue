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
        v-if="type === 'password' && showCriteria === true"
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

