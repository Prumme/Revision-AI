<script setup lang="ts">
import ToastMessage from "@/components/toasts/ToastMessage.vue";
import { ref } from "vue";

const { type, message } = defineProps<{
  type: "success" | "info" | "warning" | "error";
  message: string;
}>();

const showToast = ref(true);

const closeToast = () => {
  showToast.value = false;
};
</script>

<template>
  <transition name="fade">
    <div v-if="showToast" class="fixed lg:top-0 right-2.5 lg:right-5 lg:m-4 z-50">
      <ToastMessage :type="type" :message="message" @close="closeToast" />
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
