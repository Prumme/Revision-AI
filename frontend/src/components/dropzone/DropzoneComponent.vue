<script setup lang="ts">
import Button from "@/components/buttons/ButtonComponent.vue";
import Label from "@/components/inputs/LabelComponent.vue";
import { CloudUploadIcon, TrashIcon } from "lucide-vue-next";
import { computed, ref, watch } from "vue";

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

const acceptedFileTypes = ["image/*", "application/pdf"];
const maxFileSize = 2 * 1024 * 1024;
// const maxTokenFileSize = 25 * 1024;
const maxImageSize = { width: 100, height: 100 };

const files = ref<File[]>([]);
const error = ref<string | null>(null);

// Surveiller les changements de fichiers pour les émettre au parent
watch(
  files,
  (newValue) => {
    if (props.multiple) {
      emit("update:modelValue", newValue.length > 0 ? [...newValue] : null);
    } else {
      emit("update:modelValue", newValue.length > 0 ? newValue[0] : null);
    }
  },
  { deep: true },
);

// Initialiser les fichiers depuis modelValue (si fourni)
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      if (Array.isArray(newValue)) {
        files.value = [...newValue];
      } else {
        files.value = [newValue];
      }
    } else {
      files.value = [];
    }
  },
  { immediate: true },
);

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  error.value = null;
  const droppedFiles = e.dataTransfer?.files;
  if (droppedFiles) handleFiles(droppedFiles);
};

const handleFiles = (fileList: FileList) => {
  if (!props.multiple && files.value.length + fileList.length > 1) {
    error.value = "Un seul fichier est autorisé.";
    setErrorTimeout();
    return;
  }

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    if (!acceptedFileTypes.some((type) => file.type.match(new RegExp(type.replace("*", ".*"))))) {
      error.value = "Ce type de fichier n'est pas accepté.";
      setErrorTimeout();
      return;
    }

    if (file.size > maxFileSize) {
      error.value = "Le fichier dépasse la taille maximale de 2MB.";
      setErrorTimeout();
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
          error.value = `L'image doit être de ${maxImageSize.width}x${maxImageSize.height} max.`;
          setErrorTimeout();
        } else {
          if (!props.multiple) {
            files.value = [file];
          } else {
            files.value.push(file);
          }
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      if (!props.multiple) {
        files.value = [file];
      } else {
        files.value.push(file);
      }
    }
  }
};

// Handle file input change
const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) handleFiles(target.files);
};

// Remove file from the list
const removeFile = (index: number) => {
  files.value.splice(index, 1);
};

// Set error timeout to clear the error message after 5 seconds
const setErrorTimeout = () => {
  setTimeout(() => {
    error.value = null;
  }, 5000);
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
  return !props.multiple && files.value.length > 0;
});
</script>

<template>
  <div class="flex flex-col gap-4 font-outfit">
    <!-- Dropzone -->
    <div
      class="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex justify-center items-center cursor-pointer bg-white transition duration-200 group"
      :class="[dropzoneClasses, isDropzoneBlocked ? 'opacity-60 pointer-events-none cursor-not-allowed' : '']"
      @dragover.prevent="!isDropzoneBlocked && $event.preventDefault()"
      @drop="!isDropzoneBlocked && handleDrop($event)"
      @click="!isDropzoneBlocked && $refs.fileInput.click()"
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
          Drag and drop your file or click here
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
    <div v-if="files.length > 0" class="bg-gray-50 p-4 rounded-lg border border-gray-300">
      <Label>Fichiers renseignés</Label>
      <ul class="divide-y divide-gray-200 mt-2">
        <li
          v-for="(file, index) in files"
          :key="index"
          class="flex justify-between items-center py-2"
        >
          <span class="text-gray-700 text-sm truncate">{{ file.name }}</span>
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
      <p class="text-sm font-medium">Tips</p>
      <ul class="list-disc list-inside space-y-1">
        <li>Format acceptés: PDF, TXT, PNG, JPG, JPEG</li>
        <li>Taille maximale: 2 MB pour les fichiers</li>
        <li>Limite Analyse IA: 5.000 tokens (~25 KB pour un fichier .pdf)</li>
      </ul>
    </div>
  </div>
</template>
