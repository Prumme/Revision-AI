<script setup lang="ts">
import { computed } from "vue";
import DropdownInput from "@/components/dropdowns/DropdownInput.vue";
import { MoreVertical, FileQuestion, Calendar, ArrowRight, User } from "lucide-vue-next";
import { getCategoryColor, getCategoryLabel } from "@/helpers/quizCategory";
import { formatDate } from "@/helpers/dateFormat";
import type { Quiz } from "@/types/quiz";

interface Props {
  quiz: Quiz;
  showReportButton?: boolean;
  showStatusBadge?: boolean;
  showVisibilityInfo?: boolean;
  aspectRatio?: "square" | "auto";
  maxDescriptionLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showReportButton: false,
  showStatusBadge: false,
  showVisibilityInfo: false,
  aspectRatio: "square",
  maxDescriptionLength: 100,
});

const emit = defineEmits<{
  click: [quiz: Quiz];
  report: [quiz: Quiz];
  userClick: [username: string];
}>();

const aspectRatioClass = computed(() => {
  return props.aspectRatio === "square" ? "aspect-square" : "";
});

const truncatedDescription = computed(() => {
  const description = props.quiz.description || "Aucune description";
  if (description.length <= props.maxDescriptionLength) {
    return description;
  }
  return description.substring(0, props.maxDescriptionLength).trim() + "...";
});

const handleCardClick = () => {
  emit("click", props.quiz);
};

const handleReport = () => {
  emit("report", props.quiz);
};

const handleUserClick = () => {
  if (props.quiz.username) {
    emit("userClick", props.quiz.username);
  }
};
</script>

<template>
  <div
    class="flex flex-col border-2 border-black rounded-2xl bg-white group overflow-hidden relative transition-all duration-75 ease-in-out shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] active:translate-y-[6px] active:shadow-none cursor-pointer"
    :class="aspectRatioClass"
    @click="handleCardClick"
  >
    <!-- Dropdown de signalement -->
    <div v-if="showReportButton" class="absolute top-2 right-2 z-10" @click.stop>
      <DropdownInput position="top-right">
        <template #trigger>
          <MoreVertical class="w-5 h-5 text-gray-600" />
        </template>
        <template #menus>
          <div class="py-1">
            <button
              @click="handleReport"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Signaler ce quiz
            </button>
          </div>
        </template>
      </DropdownInput>
    </div>

    <!-- Contenu principal -->
    <div
      class="flex flex-col flex-1 p-6 rounded-t-2xl"
      :style="{
        background: `linear-gradient(135deg, ${getCategoryColor(quiz.category)}, #fff 80%)`,
      }"
    >
      <h3 class="text-2xl font-bold mb-1 truncate">{{ quiz.title }}</h3>
      <p class="text-sm text-gray-700 line-clamp-3 mb-4 flex-grow">
        {{ truncatedDescription }}
      </p>

      <div class="flex flex-wrap items-center gap-2 mt-auto text-xs">
        <span
          class="px-2 py-1 rounded-full font-semibold shadow"
          :style="{ backgroundColor: getCategoryColor(quiz.category), color: '#333' }"
        >
          {{ getCategoryLabel(quiz.category) }}
        </span>

        <div v-if="quiz.questionsNumbers" class="flex items-center gap-1 text-gray-600">
          <FileQuestion class="w-4 h-4" />
          <span>{{ quiz.questionsNumbers || 0 }} questions</span>
        </div>

        <div class="flex items-center gap-1 text-gray-600">
          <Calendar class="w-4 h-4" />
          <span>{{ formatDate(quiz.createdAt) }}</span>
        </div>

        <div v-if="quiz.username" class="flex items-center gap-1 text-gray-600">
          <User class="w-4 h-4" />
          <button
            @click.stop="handleUserClick"
            class="text-primary hover:text-primary-dark hover:underline transition-colors font-medium"
          >
            {{ quiz.username }}
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100"
    >
      <span
        v-if="showVisibilityInfo"
        :class="[
          'text-xs font-medium px-2 py-1 rounded-full',
          quiz.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600',
        ]"
      >
        {{ quiz.isPublic ? "Public" : "Privé" }}
      </span>
      <div v-else></div>

      <div
        class="text-sm text-primary flex items-center gap-1 font-semibold group-hover:underline group-hover:translate-x-1 transition-all"
      >
        Voir le quiz
        <ArrowRight class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>

    <!-- Badge de statut -->
    <div v-if="showStatusBadge" class="absolute top-0 right-0 m-2">
      <span
        v-if="quiz.status === 'pending'"
        class="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full"
      >
        En attente
      </span>
      <span
        v-else-if="quiz.status === 'published'"
        class="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full"
      >
        Publié
      </span>
      <span
        v-else-if="quiz.status === 'draft'"
        class="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full"
      >
        Brouillon
      </span>
    </div>
  </div>
</template>
