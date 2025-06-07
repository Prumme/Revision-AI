<script setup lang="ts">
import { ref } from "vue";
import draggable from "vuedraggable";

const drag = ref(false);
</script>

<template>
  <!-- Draggable pour l'ensemble des questions -->
  <draggable
    v-model="questions"
    item-key="id"
    group="questions"
    @start="drag = true"
    @end="drag = false"
    @change="updateQuestions"
  >
    <template #item="{ element: question }">
      <div class="mb-6 relative flex w-full items-start gap-2 group">
        <!-- Icone de Drag -->
        <div
          class="flex-shrink-0 -ml-2 mt-2 cursor-grab active:cursor-grabbing text-gray-extralight transition-opacity duration-150 group-hover:opacity-100 opacity-50"
        >
          <GripVertical class="w-5 h-5 text-black mt-2" />
        </div>

        <!-- Carte de la Question -->
        <section
          class="flex-1 p-5 bg-white border border-gray-extralight rounded-lg shadow-sm transition-all duration-200"
        >
          <div class="flex flex-col gap-1">
            <p class="font-outfit text-xs text-gray-light">Question</p>
            <p class="font-outfit text-lg text-black">{{ question.question }}</p>
          </div>

          <!-- Choix -->
          <ul class="flex flex-col text-sm mt-5 font-outfit text-black gap-4 list-none">
            <li
              v-for="(item, idx) in question.choices"
              :key="item.id"
              class="flex items-center gap-3 cursor-pointer select-none"
            >
              <span
                class="w-6 h-6 flex items-center justify-center text-xs font-bold border rounded-md"
                :class="{
                  'bg-success text-success border-success': item.good,
                  'bg-success/10 text-success': item.good,
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

<script lang="ts">
import { GripVertical } from "lucide-vue-next";
</script>
