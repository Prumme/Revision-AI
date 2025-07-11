<template>
  <div
    :class="['relative group bg-white rounded-2xl flex flex-col h-full aspect-square overflow-hidden transition-all duration-100 shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:cursor-pointer hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-none border-2 hover:border-black focus-within:border-black/40', gradientClass]"
  >
    <!-- Badge en haut à droite -->
    <div class="absolute top-0 right-0 m-2 z-20">
      <slot name="badge"></slot>
    </div>
    <!-- Titre -->
    <div class="px-4 pt-4 flex items-center gap-2">
      <slot name="icon"></slot>
      <h3 class="font-bold text-xl text-gray-900 truncate">
        <slot name="title"></slot>
      </h3>
    </div>
    <div class="px-4 pt-1 pb-2 flex items-center gap-3 text-xs text-gray-600">
      <span class="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow">{{ getCategoryLabel(category) }}</span>
      <span v-if="date" class="flex items-center gap-1">
        <CalendarIcon :size="16" class="text-gray-500" />
        {{ formatDateSlot(date) }}
      </span>
      <span class="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list text-gray-500"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
        {{ questionsCount }} questions
      </span>
    </div>
    <!-- Description -->
    <div class="px-4 flex-1 flex items-center justify-center text-gray-700 text-sm text-center">
      <slot name="description"></slot>
    </div>
    <!-- Actions et statut -->
    <div class="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100">
      <slot name="status"></slot>
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CalendarIcon } from "lucide-vue-next";

const props = defineProps({
  category: {
    type: String,
    default: '',
  },
  date: {
    type: [String, Date],
    default: undefined,
  },
  questionsCount: {
    type: Number,
    default: undefined,
  },
});

const categoryGradientClass: Record<string, string> = {
  history: 'bg-gradient-to-br from-blue-100 to-blue-300',
  sciences: 'bg-gradient-to-br from-green-100 to-green-300',
  geography: 'bg-gradient-to-br from-green-100 to-green-300',
  mathematics: 'bg-gradient-to-br from-rose-100 to-rose-300',
  literature: 'bg-gradient-to-br from-violet-100 via-purple-200 to-purple-400',
  arts: 'bg-gradient-to-br from-pink-100 to-pink-300',
  sports: 'bg-gradient-to-br from-red-100 to-orange-200',
  default: 'bg-gradient-to-br from-gray-100 to-gray-300',
};

const categoryLabels: Record<string, string> = {
  history: "Histoire",
  sciences: "Sciences",
  geography: "Géographie",
  mathematics: "Mathématiques",
  literature: "Littérature",
  arts: "Arts",
  sports: "Sports",
  "": "Non classé",
};

function getCategoryLabel(category?: string): string {
  return categoryLabels[category || ""] || category || "Non classé";
}

function formatDateSlot(date: string | Date | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

const gradientClass = computed(() => {
  return categoryGradientClass[props.category || 'default'] || categoryGradientClass.default;
});
</script>
