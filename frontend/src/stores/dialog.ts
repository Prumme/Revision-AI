import { defineStore } from "pinia";
import { ref, markRaw, shallowRef } from "vue";
import ReportForm from "@/components/forms/ReportForm.vue";

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "error";
  rawHtml?: boolean;
}

interface ReportDialogOptions {
  quizId?: string;
  quizName?: string;
  userId?: string;
  userName?: string;
}

type DialogComponent = typeof ReportForm;
type DialogComponentProps = ReportDialogOptions;

export const useDialogStore = defineStore("dialog", () => {
  const isOpen = ref(false);
  const options = ref<DialogOptions>({
    title: "",
    message: "",
    confirmText: "Confirmer",
    cancelText: "Annuler",
    type: "info",
    rawHtml: false,
  });

  const customComponent = shallowRef<DialogComponent | null>(null);
  const customComponentProps = ref<DialogComponentProps | null>(null);

  const resolvePromise: { resolve: (value: boolean) => void } = { resolve: () => {} };

  const show = (dialogOptions: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      options.value = {
        ...options.value,
        ...dialogOptions,
      };
      isOpen.value = true;
      resolvePromise.resolve = resolve;
      customComponent.value = null;
      customComponentProps.value = null;
    });
  };

  const showReport = (reportOptions: ReportDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      isOpen.value = true;
      resolvePromise.resolve = resolve;
      customComponent.value = markRaw(ReportForm);
      customComponentProps.value = reportOptions;
    });
  };

  const confirm = () => {
    isOpen.value = false;
    resolvePromise.resolve(true);
  };

  const cancel = () => {
    isOpen.value = false;
    resolvePromise.resolve(false);
  };

  return {
    isOpen,
    options,
    customComponent,
    customComponentProps,
    show,
    showReport,
    confirm,
    cancel,
  };
});
