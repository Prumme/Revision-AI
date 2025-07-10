<script setup lang="ts">
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon, XIcon } from "lucide-vue-next";
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  message: string;
  type?: "success" | "info" | "warning" | "error";
  duration?: number;
}>();

const emit = defineEmits(["close"]);

const iconMap = {
  success: CheckCircleIcon,
  info: InfoIcon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
};

const colorMap = {
  success: "bg-success/10 border border-success text-success",
  info: "bg-blue-light border border-blue text-blue",
  warning: "bg-primary/10 border border-primary text-primary",
  error: "bg-error/10 border border-error text-error",
};

const iconColor = {
  success: "text-success hover:text-success/80",
  info: "text-blue hover:text-blue/80",
  warning: "text-primary hover:text-primary/80",
  error: "text-error hover:text-error/80",
};

const Icon = iconMap[props.type || "info"];
const colorClass = colorMap[props.type || "info"];

const timer = ref<number | null>(null);

const closeToast = () => {
  emit("close");
  if (timer.value) {
    clearTimeout(timer.value);
  }
};

onMounted(() => {
  if (props.duration) {
    timer.value = window.setTimeout(() => {
      closeToast();
    }, props.duration);
  }
});

onBeforeUnmount(() => {
  if (timer.value) {
    clearTimeout(timer.value);
  }
});
</script>

<template>
  <div class="bg-white">
    <div
      :class="[
        'flex items-center gap-4 lg:p-4 rounded-lg shadow-md w-full whitespace-nowrap',
        colorClass,
        'transition-opacity duration-500 ease-in-out',
      ]"
      class="font-outfit"
      role="alert"
    >
      <component :is="Icon" class="w-5 h-5 text-xl" />
      <span class="font-medium">{{ message }}</span>

      <button
        @click="closeToast"
        class="lg:ml-4 p-1 text-sm focus:outline-none"
        :class="iconColor[props.type || 'info']"
      >
        <XIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
