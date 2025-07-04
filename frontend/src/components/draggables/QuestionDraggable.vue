<script setup lang="ts">
import { GripVertical, CheckCircle2, XCircle } from "lucide-vue-next";
import { ref, watch, computed } from "vue";
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
const selectedAnswers = ref<Record<number, number[]>>({});
const showResult = ref(false);

const updateQuestions = () => {
  emit("update:questions", props.questions);
};

watch(
  () => props.questions,
  () => {
    selectedAnswers.value = {};
  },
  { deep: true }
);

const isCorrectionActive = computed(() => props.showAllAnswers || props.mode === 'quiz' && props.showCorrection);

const selectAnswer = (questionIdx: number, answerIdx: number) => {
  if (props.mode === 'config') return;
  if (isCorrectionActive.value) return;
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
                (mode === 'config' && showAllAnswers && !!item.c) ? 'border-success rounded-lg' : '',
                isSelected(index, idx) && mode === 'quiz' ? 'rounded-lg shadow-md scale-[1.03] bg-primary/10' : '',
                (mode !== 'config' && showAllAnswers && !!item.c) ? 'border-success rounded-lg' : ''
              ]"
            >
              <span
                class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md transition-colors duration-200"
                :class="[
                  (mode === 'config' && showAllAnswers && !!item.c) ? 'bg-success text-white' : '',
                  (mode !== 'config' && showAllAnswers && !!item.c) ? 'bg-success text-white' : 'border border-gray-400 text-gray-600',
                  isSelected(index, idx) && mode === 'quiz' ? 'text-primary' : ''

                ]"
              >
                {{ String.fromCharCode(65 + idx) }}
              </span>
              <span :class="[
                isSelected(index, idx) && mode === 'quiz' ? 'text-primary font-semibold transition-colors duration-200' : 'transition-colors duration-200',
                (mode === 'config' && showAllAnswers && !!item.c) ? 'text-success font-semibold' : '',
                (mode !== 'config' && showAllAnswers && !!item.c) ? 'text-success font-semibold' : ''
              ]">{{ item.a }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </draggable>

  <template v-else>
    <div v-for="(question, index) in questions" :key="question.id || index" class="mb-6 relative flex items-start gap-2 group">
      <section
        class="flex flex-col p-5 bg-white border border-gray-extralight rounded-lg shadow-sm w-full flex-wrap"
      >
        <div class="flex flex-col gap-1">
          <div class="flex justify-between items-center">
            <p class="font-outfit text-lg text-black">{{ question.question }}</p>
            <span v-if="question.answers.filter(a => a.c).length > 1" class="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">Choix multiple</span>
          </div>
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
              (isCorrectionActive && item.c) ? 'border-success rounded-lg' : '',
              (isCorrectionActive && isSelected(index, idx) && !item.c) ? 'border-danger bg-danger/10 rounded-lg' : '',
              isSelected(index, idx) && !isCorrectionActive ? 'scale-[1.03]' : ''
            ]"
          >
            <span
              class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md transition-colors duration-200"
              :class="[
                isCorrectionActive && item.c ? 'border-success text-success bg-success' : '',
                isCorrectionActive && isSelected(index, idx) && !item.c ? 'bg-red-500 text-red-500 border-red-500' : '',
                isSelected(index, idx) && !isCorrectionActive ? 'bg-primary text-white' : 'border border-gray-400 text-gray-600 bg-white'
              ]"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>
            <div class="flex items-center justify-between w-full">
              <span :class="[
                isCorrectionActive && item.c ? 'text-success font-semibold' : '',
                isCorrectionActive && isSelected(index, idx) && !item.c ? 'text-red-500 font-semibold' : '',
                isSelected(index, idx) && !isCorrectionActive ? 'text-primary font-semibold' : 'transition-colors duration-200'
              ]">{{ item.a }}</span>
              <template v-if="isCorrectionActive">
                <CheckCircle2 v-if="item.c" class="w-5 h-5 text-success ml-2" />
                <XCircle v-else-if="isSelected(index, idx) && !item.c" class="w-5 h-5 text-red-500   ml-2" />
              </template>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </template>

  <!-- Result Display for Quiz Mode -->
  <div
    v-if="mode === 'quiz' && showResult"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 class="font-outfit text-lg font-semibold mb-4">Résultat</h3>
      <div v-for="(question, index) in questions" :key="question.id || index" class="mb-4">
        <p class="font-outfit text-md text-black">{{ question.question }}</p>
        <div class="flex flex-col gap-2">
          <div
            v-for="(item, idx) in question.answers"
            :key="idx"
            class="flex items-center gap-3"
          >
            <span
              class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md"
              :class="[
                item.c ? 'bg-success text-white' : 'bg-gray-200',
                isSelected(index, idx) ? 'ring-2 ring-primary' : ''
              ]"
            >
              {{ String.fromCharCode(65 + idx) }}
            </span>
            <span class="font-outfit text-black" :class="{'line-through': !item.c && isSelected(index, idx)}">{{ item.a }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
