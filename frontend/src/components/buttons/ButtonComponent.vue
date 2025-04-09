<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="{
      'w-full inline-flex items-center justify-center font-outfit font-medium transition-all duration-75 ease-in-out border-2 border-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed': true,

      // Sizes (Responsive with Tailwind classes)
      // Default size (larger on bigger screens)
      'px-6 py-2.5 text-sm': size == 'default',
      'px-4 py-2 text-base': size == 'default' && windowWidth >= 768 && windowWidth < 1024,
      'px-3 py-1.5 text-sm': size == 'default' && windowWidth < 768,

      // Icon size
      'px-1.5 py-1.5 w-min': size == 'icon',

      // Variants
      'bg-primary text-black shadow-[0_6px_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] rounded-lg hover:cursor-pointer text-base':
        variant === 'primary',
      'bg-transparent text-black hover:bg-primary hover:text-black shadow-[0_6px_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] rounded-lg hover:cursor-pointer px-14 py-2.5 text-base':
        variant === 'outline',
    }"
  >
    <slot v-if="size === 'icon'" />

    <slot v-if="size === 'default'" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline";
  size?: "default" | "icon";
  disabled?: boolean;
}>();

const { type = "button", variant = "primary", size = "default", disabled = false } = props;
</script>
