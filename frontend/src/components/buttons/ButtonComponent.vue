<script setup lang="ts">
const props = defineProps<{
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "outline"
    | "rounded-full"
    | "secondary"
    | "secondary-inverted"
    | "danger"
    | "ghost";
  size?: "default" | "icon";
  positionIcon?: "left" | "right";
  withIcon?: boolean;
  disabled?: boolean;
}>();

// Ne pas destructurer les props pour conserver la réactivité
const { type = "button" } = props;
</script>

<template>
  <button
    :type="type"
    :disabled="props.disabled"
    :class="{
      'w-full inline-flex items-center justify-center font-outfit font-medium transition-all duration-75 ease-in-out border-2 border-black focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed': true,

      // Sizes (Responsive with Tailwind classes)
      'px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base lg:px-6 lg:py-2.5 lg:text-base':
        (props.size || 'default') === 'default',

      // Icon size
      'px-1.5 py-1.5 w-min': (props.size || 'default') === 'icon',

      // Variants
      'bg-primary text-black shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] rounded-lg hover:cursor-pointer text-base':
        (props.variant || 'primary') === 'primary',
      'bg-transparent text-black hover:bg-primary hover:text-black shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] rounded-lg hover:cursor-pointer px-14 py-2.5 text-base':
        (props.variant || 'primary') === 'outline',
      'bg-primary/80 text-black shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] hover:cursor-pointer text-base rounded-full':
        variant === 'rounded-full',
      'bg-white text-black shadow-[0_4px_0_#000] hover:bg-primary hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] hover:cursor-pointer text-base rounded-full':
        variant === 'secondary',
      'bg-primary text-black shadow-[0_4px_0_#000] hover:bg-primary hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] hover:cursor-pointer text-base rounded-full':
        variant === 'secondary-inverted',
      'bg-red-500 text-white shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] rounded-lg hover:cursor-pointer text-base hover:bg-red-600':
        (props.variant || 'primary') === 'danger',
      'bg-transparent text-black hover:bg-gray-100 hover:text-black shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-[0_0px_0_#000] rounded-lg hover:cursor-pointer px-14 py-2.5 text-base':
        (props.variant || 'primary') === 'ghost',

      // Icon position
      'flex items-center flex-row-reverse gap-2.5': props.positionIcon === 'right',
      'flex items-center flex-row gap-2.5': props.positionIcon === 'left',
    }"
  >
    <span v-if="props.positionIcon === 'left'">
      <slot name="icon" />
    </span>

    <span v-if="props.positionIcon === 'right'">
      <slot name="icon" />
    </span>

    <slot v-if="(props.size || 'default') === 'icon'" />

    <slot v-if="(props.size || 'default') === 'default'" />
  </button>
</template>
