import { defineStore } from "pinia";
import { ref, markRaw, shallowRef } from "vue";
import ReportForm from "@/components/forms/ReportForm.vue";
import BlockUserDialog from "@/components/admin/BlockUserDialog.vue";
import type { User } from "@/types/user";

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

interface BlockUserDialogOptions {
  user: User | null;
  loading?: boolean;
}

type DialogComponent = typeof ReportForm | typeof BlockUserDialog;
type DialogComponentProps = ReportDialogOptions | BlockUserDialogOptions;

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

  let currentResolver: ((value: boolean | string) => void) | null = null;

  const show = (dialogOptions: DialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      options.value = {
        ...options.value,
        ...dialogOptions,
      };
      isOpen.value = true;
      currentResolver = resolve as (value: boolean | string) => void;
      customComponent.value = null;
      customComponentProps.value = null;
    });
  };

  const showReport = (reportOptions: ReportDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      isOpen.value = true;
      currentResolver = resolve as (value: boolean | string) => void;
      customComponent.value = markRaw(ReportForm);
      customComponentProps.value = reportOptions;
    });
  };

  const showBlockUser = (blockOptions: BlockUserDialogOptions): Promise<string | boolean> => {
    return new Promise<string | boolean>((resolve) => {
      isOpen.value = true;
      currentResolver = resolve;
      customComponent.value = markRaw(BlockUserDialog);
      customComponentProps.value = blockOptions;
    });
  };

  const confirm = () => {
    isOpen.value = false;
    if (currentResolver) {
      currentResolver(true);
      currentResolver = null;
    }
  };

  const confirmWithData = (data: string | undefined) => {
    isOpen.value = false;
    if (currentResolver) {
      currentResolver(data || true);
      currentResolver = null;
    }
  };

  const cancel = () => {
    isOpen.value = false;
    if (currentResolver) {
      currentResolver(false);
      currentResolver = null;
    }
  };

  return {
    isOpen,
    options,
    customComponent,
    customComponentProps,
    show,
    showReport,
    showBlockUser,
    confirm,
    confirmWithData,
    cancel,
  };
});
