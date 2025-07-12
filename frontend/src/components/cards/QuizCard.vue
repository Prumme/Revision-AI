<template>
  <div
    :class="[
      'relative group rounded-xl flex flex-col h-full  transition-all duration-200 border-1 border-black/40 hover:border-white',
      gradientClass
    ]"
    style="background-blend-mode: multiply;"
  >
    

    <!-- Titre et icône -->
    <div class="relative z-10 px-6 pt-4 flex-col items-center gap-4">
    <div>
        <span
        class="inline-block rounded-full px-3 py-1 mb-3 text-xs font-bold shadow bg-white/80 border border-white/60 text-gray-900"
        >
        <TagIcon :size="16" class="inline-block mr-1 text-gray-500" />
        {{ getCategoryLabel(category) }}
      </span>
      </div>
      <h3 class="font-extrabold text-2xl text-gray-900  tracking-tight truncate">
        <slot name="title"></slot>
      </h3>
    </div>
    <!-- Infos principales -->
    <div class="relative z-10 px-7 pt-3 pb-4 flex flex-col gap-2 text-xs text-black font-semibold opacity-80">
      
      <span v-if="date" class="flex items-center gap-1">
        <CalendarIcon :size="16" />
        {{ formatDateSlot(date) }}
      </span>
      <span class="flex items-center gap-1">
        <List :size="16"/>
        {{ questionsCount }} questions
      </span>
    </div>
    <!-- Description -->
    <div class="relative z-10 px-7 flex-1 flex items-start text-gray-900 text-base font-medium">
      <slot name="description"></slot>
    </div>
    <!-- Actions et statut -->
    <div class="relative z-10 flex justify-between items-center px-7 py-5 rounded-b-xl border-t border-white/40 bg-white/60 backdrop-blur-md mt-2">
      <slot name="status"></slot>
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CalendarIcon, List, TagIcon } from "lucide-vue-next";

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
console.log('Gradient class:', gradientClass.value);
</script>
