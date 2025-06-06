<script setup lang="ts">
import { GripVertical } from "lucide-vue-next";
import { ref } from "vue";
import draggable from "vuedraggable";

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(["update:questions"]);

const drag = ref(false);

const updateQuestions = () => {
  emit("update:questions", props.questions);
};
</script>

<template>
  <draggable
    :list="questions"
    item-key="id"
    group="questions"
    @start="drag = true"
    @end="drag = false"
    @change="updateQuestions"
    :ghost-class="'opacity-50'"
  >
    <template #item="{ element: question, index }">
      <div class="mb-6 relative flex items-start gap-2 group w-full">
        <!-- Question Cards -->
        <section
          class="flex flex-col p-5 bg-white border border-gray-extralight rounded-lg shadow-sm w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-wrap"
        >
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center">
              <p class="font-outfit text-sm text-gray-light">Question {{ index + 1 }}</p>
              <!-- Drag Icon -->
              <div
                class="flex-shrink-0 -ml-2 cursor-grab active:cursor-grabbing text-gray-extralight transition-opacity duration-150 group-hover:opacity-100 opacity-50"
              >
                <GripVertical class="w-5 h-5 text-black" />
              </div>
            </div>
            <p class="font-outfit text-lg text-black mt-3">{{ question.question }}</p>
          </div>

          <!-- Answers -->
          <ul class="flex flex-col text-sm mt-5 font-outfit text-black gap-4 list-none">
            <li
              v-for="(item, idx) in question.choices"
              :key="idx"
              class="flex items-center gap-3 cursor-pointer select-none"
            >
              <span
                class="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md"
                :class="{
                  'bg-success text-white': item.good,
                  'border-gray-400 text-gray-600': !item.good,
                }"
              >
                {{ String.fromCharCode(65 + idx) }}
              </span>
              <span>{{ item.choice }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </draggable>
</template>
