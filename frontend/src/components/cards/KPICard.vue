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
          <Motion
            v-if="isAnimated"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            transition="{ duration: 0.5 }"
          >
            {{ animatedDisplayValue }}
          </Motion>
          <template v-else>
            {{ animatedDisplayValue }}
          </template>
        </div>
      </div>
      <slot name="icon"></slot>
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
  'pale-green': ['#e6fbe9', '#9effbb'],
  'pale-yellow': ['#fffbe6', '#ffec9e'],
  'pale-purple': ['#f3f0ff', '#a89eff'],
  'pale-red': ['#ffeaea', '#ff9ea0'],
};

const gradientStyle = computed(() => {
  const colors = colorMap[props.color] || colorMap['pale-green'];
  return `background: linear-gradient(90deg, ${colors[0]}, ${colors[1]})`;
});

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
