<template>
  <div
    :class="['relative group bg-white rounded-2xl flex flex-col h-full aspect-square overflow-hidden transition-all duration-100 shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:cursor-pointer   hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-none border-2 hover:border-black focus-within:border-black/40', gradientClass]"
  >
    <div class="p-4 flex-1 flex flex-col gap-2 relative z-10">
      <div class="flex items-center gap-2 mb-2">
        <slot name="icon"></slot>
        <h3 class="font-bold text-lg text-gray-900 truncate">
          <slot name="title"></slot>
        </h3>
      </div>
      <div class="text-gray-700 text-sm flex-1">
        <slot name="description"></slot>
      </div>
      <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <slot name="meta" :getCategoryLabel="getCategoryLabel" :formatDate="formatDateSlot"></slot>
      </div>
    </div>
    <div class="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100 relative z-10">
      <slot name="status"></slot>
      <slot name="action"></slot>
    </div>
    <div class="absolute top-0 right-0 m-2 z-20">
      <slot name="badge"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  category: {
    type: String,
    default: '',
  },
});

const categoryGradientClass: Record<string, string> = {
  general_history: 'bg-gradient-to-br from-[#e5d5f7] to-[#a78bfa]',
  sciences: 'bg-gradient-to-br from-[#cce4f6] to-[#38bdf8]',
  geography: 'bg-gradient-to-br from-[#daf5e2] to-[#4ade80]',
  mathematics: 'bg-gradient-to-br from-[#cce4f6] to-[#818cf8]',
  literature: 'bg-gradient-to-br from-[#fdf4cc] to-[#fbbf24]',
  arts: 'bg-gradient-to-br from-[#f9d0d0] to-[#f472b6]',
  sports: 'bg-gradient-to-br from-[#e5d5f7] to-[#f472b6]',
  default: 'bg-gradient-to-br from-[#e5e5e5] to-[#a3a3a3]',
};

const categoryLabels: Record<string, string> = {
  general_history: "Histoire générale",
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
