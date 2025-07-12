<template>
  <div class="flex border-b border-gray-200 mb-6">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="() => {
        if (!tab.disabled) emitTab(tab.key)
      }"
      class="font-outfit px-4 py-2 -mb-px text-lg transition-colors duration-150 relative"
      :class="[
        activeTab === tab.key
          ? 'border-b-2 border-primary text-black font-semibold'
          : 'text-black-transparent hover:text-black',
        tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
      style="background: none"
      :disabled="tab.disabled"
      type="button"
    >
      <span>{{ tab.label }}
        <template v-if="tab.badge !== undefined">
          <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-white text-xs font-semibold">
            {{ tab.badge }}
          </span>
        </template>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
// Utilisation de defineProps sans assignation à une variable pour éviter l'erreur ESLint

defineProps({
  tabs: {
    type: Array as () => { key: string; label: string; badge?: number; disabled?: boolean }[],
    required: true,
  },
  activeTab: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['update:activeTab']);
function emitTab(key: string) {
  emit('update:activeTab', key);
}
</script>
