<template>
  <div class="bg-white rounded-lg shadow-md">
    <div v-if="$slots.header" class="px-4 md:px-6 pt-6 pb-2">
      <slot name="header" />
    </div>

    <div class="px-4 md:px-6 pb-6">
      <slot name="content" />
    </div>

    <div v-if="$slots.actions" class="px-4 md:px-6 pb-4">
      <slot name="actions" />
    </div>

    <div v-if="$slots.footer" class="px-4 md:px-6 pb-6">
      <slot name="footer" />
    </div>
  </div>
</template>
