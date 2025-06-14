<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import ToastComponent from "./ToastComponent.vue";
</script>

<template>
  <div class="fixed top-0 right-0 z-50 p-4 space-y-4">
    <TransitionGroup name="fade">
      <ToastComponent
        v-for="toast in useToastStore().toasts"
        :key="toast.id"
        :type="toast.type"
        :message="toast.message"
        @close="useToastStore().removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
