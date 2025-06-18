import { defineStore } from "pinia";
import { ref } from "vue";

type ToastType = "success" | "info" | "warning" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);
  let nextId = 1;

  function showToast(type: ToastType, message: string) {
    const id = nextId++;
    toasts.value.push({ id, type, message });

    // Supprimer automatiquement le toast après 3 secondes
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  return {
    toasts,
    showToast,
    removeToast,
  };
});
