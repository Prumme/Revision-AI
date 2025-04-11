<script setup lang="ts"></script>

<template>
  <section
    id="form-card"
    class="flex flex-col p-5 bg-white border-1 border-gray-extralight rounded-lg"
  >
    <div class="flex items-center gap-3">
      <h1 class="font-outfit text-lg text-black-transparent mb-4">
        <slot name="title"></slot>
      </h1>
    </div>
    <p class="font-outfit text-lg text-black-transparent">
      <slot name="description"></slot>
    </p>
    <slot name="content"> </slot>
    <slot name="footer"></slot>
  </section>
</template>
