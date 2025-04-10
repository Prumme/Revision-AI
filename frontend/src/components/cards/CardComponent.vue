<template>
  <div
    class="flex flex-col justify-center items-center bg-white rounded-lg px-2 md:px-8 lg:px-12 py-6 lg:py-12 shadow-md"
  >
    <slot name="header" class="bg-red-500" />

    <slot name="content" />

    <slot name="actions" />

    <slot name="footer" />
  </div>
</template>
