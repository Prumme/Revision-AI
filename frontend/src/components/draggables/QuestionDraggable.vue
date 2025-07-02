<script setup lang="ts">
import { GripVertical } from "lucide-vue-next";
import { ref, watch } from "vue";
import draggable from "vuedraggable";

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    default: () => [],
  },
  showAllAnswers: {
    type: Boolean,
    default: false,
  },
  userSelection: {
    type: Object,
    default: undefined,
  },
  mode: {
    type: String,
    default: 'quiz', // 'quiz' ou 'config'
    validator: (v: string) => ['quiz', 'config'].includes(v),
  },
});

const emit = defineEmits(["update:questions", "update:selection"]);

const drag = ref(false);
const selectedAnswers = ref<Record<number, number[]>>({}); // {questionIndex: [selectedAnswerIndexes]}

const updateQuestions = () => {
  // Émet directement la nouvelle liste des questions
  emit("update:questions", props.questions);
};

// Reset la sélection à chaque changement de questions (utile pour le mode quiz)
watch(
  () => props.questions,
  () => {
    selectedAnswers.value = {};
  },
  { deep: true }
);

const selectAnswer = (questionIdx: number, answerIdx: number) => {
  if (props.mode === 'config') return; // Désactive la sélection en mode config
  const question = props.questions[questionIdx];
  if (!question) return;
  const correctCount = question.answers.filter((a) => a.c).length;
  if (!selectedAnswers.value[questionIdx]) selectedAnswers.value[questionIdx] = [];
  if (correctCount > 1) {
    const idx = selectedAnswers.value[questionIdx].indexOf(answerIdx);
    if (idx === -1) selectedAnswers.value[questionIdx].push(answerIdx);
    else selectedAnswers.value[questionIdx].splice(idx, 1);
  } else {
    selectedAnswers.value[questionIdx] = [answerIdx];
  }
  emit("update:selection", { ...selectedAnswers.value });
};

const isSelected = (questionIdx: number, answerIdx: number) => {
  if (props.userSelection && props.userSelection[questionIdx]) {
    return props.userSelection[questionIdx].includes(answerIdx);
  }
  return selectedAnswers.value[questionIdx]?.includes(answerIdx);
};
</script>

<template>
  <draggable
    v-if="mode === 'config'"
    :list="questions"
    item-key="id"
    group="questions"
    @start="drag = true"
    @end="drag = false"
    @change="updateQuestions"
    :ghost-class="'opacity-50'"
  >
    <template #item="{ element: question, index }">
      <div class="mb-6 relative flex items-start gap-2 group">
        <!-- Question Cards -->
        <section
          class="flex flex-col p-5 bg-white border border-gray-extralight rounded-lg shadow-sm w-full flex-wrap"
        >
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center">
              <p class="font-outfit text-sm text-gray-light">Question {{ index + 1 }}</p>
              <!-- Drag Icon -->
              <div
                v-if="mode === 'config'"
                class="flex-shrink-0 -ml-2 cursor-grab active:cursor-grabbing text-gray-extralight transition-opacity duration-150 group-hover:opacity-100 opacity-50"
              >
                <GripVertical class="w-5 h-5 text-black" />
              </div>
            </div>
            <!-- Question title -->
            <p class="font-outfit text-lg text-black mt-3">{{ question.question }}</p>
            <p class="font-outfit text-lg text-black">{{ question.q }}</p>
          </div>

          <ul
            class="flex flex-col text-sm mt-5 font-outfit text-black gap-4 list-none"
          >
            <li
              v-for="(item, idx) in question.answers"
              :key="idx"
              class="flex items-center gap-3 cursor-pointer select-none transition-all duration-200"
              @click="selectAnswer(index, idx)"
              :class="[
                (mode === 'config' && showAllAnswers && !!item.c) ? 'border-success rounded-lg bg-success/10' : '',
                isSelected(index, idx) ? 'border-primary rounded-lg shadow-md scale-[1.03] bg-primary/10' : '',
                (mode !== 'config' && showAllAnswers && !!item.c) ? 'border-success rounded-lg' : ''
              ]"
              style="border-width: 2px; border-style: solid; border-color: transparent;"
            >
              <span
                class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md transition-colors duration-200"
                :class="[
                  (mode === 'config' && showAllAnswers && !!item.c) ? 'bg-success text-white' : '',
                  (mode !== 'config' && showAllAnswers && !!item.c) ? 'bg-success text-white' : 'border border-gray-400 text-gray-600',
                  isSelected(index, idx) ? 'border-primary text-primary' : ''
                ]"
              >
                {{ String.fromCharCode(65 + idx) }}
              </span>
              <span :class="[
                (mode === 'config' && showAllAnswers && !!item.c) ? 'text-success font-semibold transition-colors duration-200' : '',
                isSelected(index, idx) ? 'text-primary font-semibold transition-colors duration-200' : 'transition-colors duration-200',
                (mode !== 'config' && showAllAnswers && !!item.c) ? 'text-success font-semibold' : ''
              ]">{{ item.a }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </draggable>
  <template v-else>
    <div v-for="(question, index) in questions" :key="question.id" class="mb-6 relative flex items-start gap-2 group">
      <section
        class="flex flex-col p-5 bg-white border border-gray-extralight rounded-lg shadow-sm w-full flex-wrap"
      >
        <div class="flex flex-col gap-1">
          <div class="flex justify-between items-center">
            <p class="font-outfit text-sm text-gray-light">Question {{ index + 1 }}</p>
          </div>
          <p class="font-outfit text-lg text-black mt-3">{{ question.question }}</p>
          <p class="font-outfit text-lg text-black">{{ question.q }}</p>
        </div>
        <ul
          class="flex flex-col text-sm mt-5 font-outfit text-black gap-4 list-none"
        >
          <li
            v-for="(item, idx) in question.answers"
            :key="idx"
            class="flex items-center gap-3 cursor-pointer select-none transition-all duration-200"
            @click="selectAnswer(index, idx)"
            :class="[
              isSelected(index, idx) ? 'border-primary rounded-lg shadow-md scale-[1.03] bg-primary/10' : '',
              showAllAnswers && !!item.c ? 'border-success rounded-lg' : ''
            ]"
            style="border-width: 2px; border-style: solid; border-color: transparent;"
          >
            <span
              class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md transition-colors duration-200"
              :class="[
                showAllAnswers && !!item.c ? 'bg-success text-white' : 'border border-gray-400 text-gray-600',
                isSelected(index, idx) ? 'border-primary text-primary' : ''
              ]"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>
            <span :class="[
              isSelected(index, idx) ? 'text-primary font-semibold transition-colors duration-200' : 'transition-colors duration-200',
              showAllAnswers && !!item.c ? 'text-success font-semibold' : ''
            ]">{{ item.a }}</span>
          </li>
        </ul>
      </section>
    </div>
  </template>
</template>
