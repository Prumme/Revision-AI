<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Label from "@/components/inputs/LabelComponent.vue";
import { CloudUploadIcon, TrashIcon } from "lucide-vue-next";
import { computed, ref, useTemplateRef } from "vue";
import AutoFileIcon from "../icons/AutoFileIcon.vue";

const props = withDefaults(
  defineProps<{
    multiple: boolean;
    variant?: "yellow" | "blue";
    modelValue?: File | File[] | null; // Ajout de la prop modelValue pour v-model
  }>(),
  {
    variant: "blue",
    modelValue: null,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: File | File[] | null): void;
}>();

const fileInput = useTemplateRef("fileInput");
const error = ref<string | null>(null);
const acceptedFileTypes = ["image/*", "application/pdf"];
const maxFileSize = 2 * 1024 * 1024;
const maxImageSize = { width: 3000, height: 3000 };

const files = computed({
  get: () => props.modelValue,
  set: (newValue : File | File[] | null) => {
    if (props.multiple) {
      if(!Array.isArray(newValue)) {
        throw new Error("Pour le mode multiple, modelValue doit être un tableau de fichiers.");
      }
      emit("update:modelValue", newValue.length > 0 ? [...newValue] : null);
    } else {
      if (Array.isArray(newValue)) {
        throw new Error("Pour le mode simple, modelValue doit être un seul fichier.");
      }
      emit("update:modelValue", newValue || null);
    }
  },
});

const filesAsArray = computed(() => {
  return Array.isArray(files.value) ? files.value : files.value ? [files.value] : [];
});


const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  error.value = null;
  const droppedFiles = e.dataTransfer?.files;
  if (droppedFiles) handleFiles(droppedFiles);
};

const handleFiles = (fileList: FileList) => {
  if (!props.multiple && filesAsArray.value?.length + fileList.length > 1) {
    setError("Un seul fichier est autorisé.");
    return;
  }

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    if (!acceptedFileTypes.some((type) => file.type.match(new RegExp(type.replace("*", ".*"))))) {
      setError("Ce type de fichier n'est pas accepté.");
      return;
    }

    if (file.size > maxFileSize) {
      setError("Le fichier dépasse la taille maximale de 2MB.");
      return;
    }

    // if (["application/pdf", "text/plain"].includes(file.type) && file.size > maxTokenFileSize) {
    //   error.value = "Le fichier dépasse la limite de 5 000 tokens (~25 Ko).";
    //   setErrorTimeout();
    //   return;
    // }

    if (file.type.startsWith("image")) {
      const img = new Image();
      img.onload = () => {
        if (img.width > maxImageSize.width || img.height > maxImageSize.height) {
          setError(`L'image doit être de ${maxImageSize.width}x${maxImageSize.height} max.`);
        } else {
          if (!props.multiple) {
            files.value = file;
          } else {
            files.value = Array.isArray(files.value) ? [...files.value, file] : [file];
          }
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      if (!props.multiple) {
            files.value = file;
          } else {
            files.value = Array.isArray(files.value) ? [...files.value, file] : [file];
          }
    }
  }
};

// Handle file input change
const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) handleFiles(target.files);
};


const setError = (message: string) => {
  error.value = message;
  setTimeout(() => {
      error.value = null;
    }, 5000);
};


// Remove file from the list
const removeFile = (index: number) => {
  if(!props.multiple) {
    files.value = null; // Pour le mode simple, on remet à null
    return;
  }

  const fileArray = Array.isArray(files.value) ? files.value : [];
  files.value = [
    ...fileArray.slice(0, index),
    ...fileArray.slice(index + 1),
  ];
};

// Computed class for dropzone based on variant
const dropzoneClasses = computed(() => {
  return props.variant === "yellow"
    ? "hover:border-primary/80 hover:bg-primary/10"
    : props.variant === "blue"
      ? "hover:border-blue hover:bg-blue-light"
      : "hover:border-gray-300";
});

// If not multiple, block dropzone if a file is present
const isDropzoneBlocked = computed(() => {
  return !props.multiple && files;
});

</script>

<template>
  <div class="flex flex-col gap-4 font-outfit">
    <!-- Dropzone -->
    <div
      class="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex justify-center items-center cursor-pointer bg-white transition duration-200 group"
      :class="[
        dropzoneClasses,
        isDropzoneBlocked ? 'opacity-60 pointer-events-none cursor-not-allowed' : '',
      ]"
      @dragover.prevent="!isDropzoneBlocked && $event.preventDefault()"
      @drop="!isDropzoneBlocked && handleDrop($event)"
      @click="!isDropzoneBlocked && fileInput?.click()"
    >
      <div class="flex flex-col items-center gap-2">
        <CloudUploadIcon
          class="stroke-[1.5] w-10 h-10 text-gray-400 group-hover:-translate-y-1 transition-transform duration-300"
          :class="
            props.variant === 'yellow'
              ? 'group-hover:text-primary'
              : props.variant === 'blue'
                ? 'group-hover:text-blue'
                : ''
          "
        />
        <span
          class="text-gray-400 text-sm"
          :class="{
            'group-hover:text-primary': props.variant === 'yellow',
            'group-hover:text-blue': props.variant === 'blue',
          }"
        >
          Glissez et déposez votre fichier ou cliquez ici
        </span>
        <input
          ref="fileInput"
          type="file"
          :multiple="props.multiple"
          :accept="acceptedFileTypes.join(',')"
          @change="handleFileInputChange"
          class="hidden"
        />
        <div v-if="error" class="text-red-600 text-xs mt-2 text-center">{{ error }}</div>
      </div>
    </div>

    <!-- File Preview -->
    <div v-if="filesAsArray?.length > 0" class="bg-gray-50 p-4 rounded-lg border border-gray-300">
      <Label for-id="file-list">Fichiers renseignés</Label>
      <ul class="divide-y divide-gray-200 mt-2">
        <li
          v-for="(file, index) in filesAsArray"
          :key="index"
          class="flex justify-between items-center py-2"
        >
          <div class="flex items-center gap-2">
            <AutoFileIcon
            :mime-type="file.type"
            class="w-6 h-6 text-gray-600"
            />
          <span class="text-gray-700 text-sm truncate">{{ file.name }}</span>
          </div>
          <Button
            size="icon"
            @click="removeFile(index)"
            class="text-error hover:text-error-dark bg-white transition-all text-sm"
          >
            <TrashIcon class="w-4 h-4" />
          </Button>
        </li>
      </ul>
    </div>

    <!-- Tips -->
    <div class="flex flex-col gap-1 rounded-lg text-xs text-gray-600 mt-2">
      <p class="text-sm font-medium">Conseil</p>
      <ul class="list-disc list-inside space-y-1">
        <li>Format acceptés: PDF, TXT, PNG, JPG, JPEG</li>
        <li>Taille maximale: 2 MB pour les fichiers</li>
        <li>Limite Analyse IA: 5.000 tokens (~25 KB pour un fichier .pdf)</li>
      </ul>
    </div>
  </div>
</template>
