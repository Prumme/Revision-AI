<script setup lang="ts">
import { computed, defineProps, onMounted, onUnmounted, ref } from "vue";

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const positionClasses = computed(() => {
  switch (props.position) {
    case "top-left":
      return "top-0 left-0";
    case "top-right":
      return "top-13 right-3";
    case "bottom-left":
      return "bottom-2 left-15";
    case "bottom-right":
    default:
      return "bottom-0 right-0";
  }
});

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

const props = defineProps({
  trigger: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: "bottom-right",
  },
});

defineExpose({
  closeMenu: () => {
    isOpen.value = false;
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>

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
        class="absolute z-30 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-extralight ring-opacity-5 transition-all transform ease-in-out duration-300"
        :class="positionClasses"
      >
        <slot name="menus"></slot>
      </div>
    </transition>
  </div>
</template>
