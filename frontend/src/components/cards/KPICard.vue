<template>
  <div
    class="relative group rounded-xl  transition-all flex flex-col h-full min-h-[110px] overflow-hidden  bg-white/70 border border-gray-200"
    :style="gradientStyle"
  >
    <div class="flex flex-row items-center gap-3 p-4 flex-1 z-10 relative">
      <div class="flex flex-col flex-1">
        <div class="text-[11px] font-semibold mb-0.5 text-gray-600 uppercase tracking-widest opacity-80 ">
          {{ label }}
        </div>
        <div class="text-xl md:text-2xl font-bold text-gray-800 leading-snug ">
          <Motion
            v-if="isAnimated"
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            transition="{ duration: 0.4 }"
          >
            {{ animatedDisplayValue }}
          </Motion>
          <template v-else>
            {{ animatedDisplayValue }}
          </template>
        </div>
      </div>
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-0 rounded-full blur-md opacity-30" :style="{ background: iconHaloColor }"></div>
        <div class="relative z-10">
          <slot name="icon"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Motion } from '@motionone/vue';

const props = defineProps({
  label: String,
  value: [String, Number, Object],
  color: {
    type: String,
    default: 'pale-green',
  },
});

const colorMap = {
  'pale-green': ['#f8fdfa', '#e6f4ed'],
  'pale-yellow': ['#fefdf8', '#fdf6e6'],
  'pale-purple': ['#fafaff', '#ececf6'],
  'pale-red': ['#fffafa', '#ffecec'],
};

const iconHaloMap = {
  'pale-green': 'radial-gradient(circle, #a7f3d0 0%, #d1fae5 80%, transparent 100%)',
  'pale-yellow': 'radial-gradient(circle, #fde68a 0%, #fef9c3 80%, transparent 100%)',
  'pale-purple': 'radial-gradient(circle, #c4b5fd 0%, #ede9fe 80%, transparent 100%)',
  'pale-red': 'radial-gradient(circle, #fca5a5 0%, #fee2e2 80%, transparent 100%)',
};

const gradientStyle = computed(() => {
  const colors = colorMap[props.color] || colorMap['pale-green'];
  return `background: linear-gradient(120deg, ${colors[0]}, ${colors[1]})`;
});

const iconHaloColor = computed(() => iconHaloMap[props.color] || iconHaloMap['pale-green']);

const displayValue = computed(() => {
  if (typeof props.value === 'object' && props.value !== null && 'value' in props.value) {
    return props.value.value;
  }
  return props.value;
});

const isAnimated = computed(() => typeof displayValue.value === 'number' || /^[0-9]+$/.test(displayValue.value));

const animatedDisplayValue = ref(displayValue.value);

watch(() => displayValue.value, (newVal, oldVal) => {
  if (isAnimated.value) {
    animateCounter(oldVal, newVal);
  } else {
    animatedDisplayValue.value = newVal;
  }
}, { immediate: true });

function animateCounter(from, to) {
  const start = Number(from) || 0;
  const end = Number(to) || 0;
  if (isNaN(end)) {
    animatedDisplayValue.value = to;
    return;
  }
  const duration = 800;
  const frameRate = 60;
  const totalFrames = Math.round(duration / (1000 / frameRate));
  let frame = 0;
  const increment = (end - start) / totalFrames;
  function step() {
    frame++;
    animatedDisplayValue.value = Math.round(start + increment * frame);
    if (frame < totalFrames) {
      requestAnimationFrame(step);
    } else {
      animatedDisplayValue.value = end;
    }
  }
  step();
}
</script>

<style scoped>
.group:hover {
  /* Adoucir le hover */
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.07), 0 1.5px 4px 0 rgba(0,0,0,0.03);
  background-color: rgba(255,255,255,0.85) !important;
  border-color: #d1d5db !important;
}
</style>
