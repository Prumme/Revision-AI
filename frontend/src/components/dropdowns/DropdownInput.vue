<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from "vue";

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = (event: MouseEvent) => {
  const menu = document.getElementById("dropdown-menu");
  const button = document.getElementById("dropdown-button");

  if (
    menu &&
    button &&
    !menu.contains(event.target as Node) &&
    !button.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", closeMenu);
});

defineProps({
  trigger: Object,
});

defineExpose({
  closeMenu: () => {
    isOpen.value = false;
  },
});
</script>

<template>
  <div class="relative">
    <div
      @click="toggleMenu"
      class="cursor-pointer hover:bg-gray-extralight/40 p-2 rounded-md flex items-center gap-2 w-full"
      id="dropdown-button"
    >
      <slot name="trigger"></slot>
    </div>

    <transition name="fade" mode="out-in">
      <div
        v-if="isOpen"
        id="dropdown-menu"
        class="absolute -right-72 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-extralight ring-opacity-5 z-30 bottom-0 transition-all transform ease-in-out duration-300"
      >
        <div>
          <slot name="menus"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>
