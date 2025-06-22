<script setup lang="ts">
import { computed } from "vue";

interface BadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "secondary";
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<BadgeProps>(), {
  size: "md",
});

const badgeClasses = computed(() => {
  const baseClasses = "inline-flex items-center font-medium rounded-full border";

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base",
  };

  const variantClasses = {
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return [baseClasses, sizeClasses[props.size], variantClasses[props.variant]].join(" ");
});
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>
