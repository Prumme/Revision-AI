import { defineStore } from "pinia";
import { ref } from "vue";

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "error" | "success";
}

export const useDialogStore = defineStore("dialog", () => {
  const isOpen = ref(false);
  const options = ref<DialogOptions>({
    title: "",
    message: "",
    confirmText: "Confirmer",
    cancelText: "Annuler",
    type: "info",
  });
  let resolvePromise: ((value: boolean) => void) | null = null;

  const show = (dialogOptions: DialogOptions): Promise<boolean> => {
    options.value = {
      ...options.value,
      ...dialogOptions,
    };
    isOpen.value = true;

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
  };

  const confirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
    isOpen.value = false;
  };

  const cancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
    isOpen.value = false;
  };

  return {
    isOpen,
    options,
    show,
    confirm,
    cancel,
  };
});
