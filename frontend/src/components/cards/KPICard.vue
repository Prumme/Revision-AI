<template>
  <div
    class="relative group rounded-xl shadow-md hover:shadow-lg transition-all  flex flex-col h-full min-h-[110px] overflow-hidden"
    :style="gradientStyle"
  >
    <div class="flex flex-row items-center gap-4 p-5 flex-1 z-10 relative">
      <div class="flex flex-col flex-1">
        <div class="text-xs font-semibold mb-1 text-gray-700 uppercase tracking-wide opacity-80">
          {{ label }}
        </div>
        <div class="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          {{ value }}
        </div>
      </div>
      <slot name="icon"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  label: String,
  value: [String, Number],
  color: {
    type: String,
    default: 'pale-green',
  },
});

const colorMap = {
  'pale-green': ['#e6fbe9', '#9effbb'],
  'pale-yellow': ['#fffbe6', '#ffec9e'],
  'pale-purple': ['#f3f0ff', '#a89eff'],
  'pale-red': ['#ffeaea', '#ff9ea0'],
};

const gradientStyle = computed(() => {
  const colors = colorMap[props.color] || colorMap['pale-green'];
  return `background: linear-gradient(90deg, ${colors[0]}, ${colors[1]})`;
});
</script>
