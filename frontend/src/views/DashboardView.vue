<script setup lang="ts">
import MotionLayout from "@/components/layouts/MotionLayout.vue";
import { useUserStore } from "@/stores/user";
import KPICard from '@/components/cards/KPICard.vue';
import { onMounted, ref, watch } from 'vue';
import { QuizService } from '@/services/quiz.service';
import QuizCard from '@/components/cards/QuizCard.vue';
import MediaList from '@/components/cards/MediaList.vue';
import {ArrowRight, Calendar, FileQuestion, Plus} from 'lucide-vue-next';
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { useRouter } from "vue-router";

import illu from "@/assets/caracters/home.webp";

const userStore = useUserStore();
const user = userStore.user;
const quizCount = ref(0);
const averageScore = ref('0%');
const totalRevisionTime = ref('0m');

const userQuizzes = ref([]);
const loadingUserQuizzes = ref(false);

onMounted(async () => {
  loadingUserQuizzes.value = true;
  quizCount.value = await userStore.fetchQuizCount();
  await userStore.fetchKpis();
  averageScore.value = userStore.averageScore;
  totalRevisionTime.value = userStore.totalRevisionTimeFormatted;
  try {
    const res = await QuizService.getUserQuizzes(user?.id);
    userQuizzes.value = Array.isArray(res) ? res.slice(0, 5) : (res?.data?.slice(0, 5) || []);
  } catch {
    userQuizzes.value = [];
  } finally {
    loadingUserQuizzes.value = false;
  }
});

const animatedStats = ref([
  { label: "Quiz disponibles", value: 0, color: "pale-yellow" },
  { label: "Cours importés", value: 0, color: "pale-red" },
  { label: "Score moyen", value: 0, color: "pale-purple" },
  { label: "Temps de révision", value: 0, color: "pale-green" },
]);

watch([quizCount, averageScore, totalRevisionTime], ([newQuizCount, newAverageScore, newTotalRevisionTime]) => {
  animateNumber(animatedStats.value[0], newQuizCount);
  animateNumber(animatedStats.value[1], 16);
  animateNumber(animatedStats.value[2], parseInt(newAverageScore));
  animatedStats.value[3].value = newTotalRevisionTime; // For time, just update directly
});

function animateNumber(stat, target) {
  const start = Number(stat.value) || 0;
  const end = Number(target) || 0;
  if (isNaN(end)) {
    stat.value = target;
    return;
  }
  const duration = 1000;
  const frameRate = 60;
  const totalFrames = Math.round(duration / (1000 / frameRate));
  let frame = 0;
  const increment = (end - start) / totalFrames;
  function step() {
    frame++;
    stat.value = Math.round(start + increment * frame);
    if (frame < totalFrames) {
      requestAnimationFrame(step);
    } else {
      stat.value = end;
    }
  }
  step();
}


const stats = [
  { label: "Quiz disponibles", value: quizCount, color: "pale-yellow" },
  { label: "Cours importés", value: 16, color: "pale-red" },
  { label: "Score moyen", value: averageScore, color: "pale-purple" },
  { label: "Temps de révision", value: totalRevisionTime, color: "pale-green" },
];

const router = useRouter();
function goToQuizDetail(id: string) {
  router.push(`/quiz/${id}`);
}
</script>

<template>
  <MotionLayout>
    <section class="flex flex-col w-full mt-20 gap-10">

      <!-- Welcome Section -->
            <section
        id="welcome"
        class="bg-gradient-to-r from-primary/50 to-primary/60 text-black rounded-2xl flex flex-col md:flex-row items-center relative overflow-visible min-h-0 p-10 gap-6"
      >
        <div class="flex-1 z-10 flex flex-col justify-center gap-3">
          <h1 class="text-5xl font-extrabold drop-shadow mb-2">
            Salut <span class="blend text-black">{{ user.username }}</span> ! 👋
          </h1>
          <p class="text-xl font-medium opacity-90">
            Prêt à booster tes révisions avec l'IA ?
          </p>
          <div class="flex gap-4 mt-4 items-center">
            <router-link to="/quiz">
              <ButtonComponent>
                Lancer un quiz
              </ButtonComponent>
            </router-link>
            <div class="ml-5">
              <router-link
                to="/quiz/create"
                class="text-black/90 font-medium text-base hover:text-primary transition-colors duration-200"
              >
                <Plus class="w-4 h-4 inline-block mr-1" />
                Créer ton quiz
              </router-link>
            </div>
          </div>
        </div>
        <div class="flex-1 flex justify-end relative z-20">
            <img
            :src="illu"
            alt="Welcome Image"
            class="w-3/4 min-w-[220px] max-w-[400px] absolute right-[-30px] top-1/2 -translate-y-1/2 pointer-events-none select-none z-20"
            style="filter: drop-shadow(0 2em 1em rgba(0,0,0,0.05));"
            />
          />
        </div>
      </section>

      <!-- Statistics Section -->
      <section
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div
          v-for="(stat, i) in stats"
          :key="i"
        >
          <KPICard :label="stat.label" :value="stat.value" :color="stat.color" />
        </div>
      </section>

      <!-- Documents & QCM -->
      <section
        class="grid grid-cols-2 gap-15"
      >
        <div class="col-span-2 md:col-span-1">
          <MediaList />
        </div>
        <div class="col-span-2 md:col-span-1">
          <h2 class="text-3xl font-bold mb-5">Mes Quiz</h2>
          <p class="text-lg" v-if="userQuizzes.length === 0">Aucun QCM créé pour le moment.</p>
          <div v-else>
            <div class="flex gap-6 overflow-x-auto pb-2 custom-scrollbar">
              <div
                v-for="quiz in userQuizzes"
                :key="quiz.id"
                class="min-w-[260px] max-w-[320px] flex-shrink-0"
              >
                <QuizCard :category="quiz.category" :date="quiz.createdAt" :questionsCount="quiz.questionsNumbers" @click="goToQuizDetail(quiz.id!)">
                  <template #title>
                    <span class="text-2xl font-bold mb-1 truncate">{{ quiz.title }}</span>
                  </template>
                  <template #description>
                    <span class="text-sm text-gray-700 line-clamp-3 mb-4 flex-grow">{{ quiz.description || 'Aucune description' }}</span>
                  </template>
                  <template #meta="{ getCategoryLabel, formatDate }">
                    <span class="px-3 py-1 rounded-full font-bold shadow text-base bg-white/80 border border-black/10 text-gray-900 whitespace-nowrap">
                        {{ getCategoryLabel(quiz.category) }}
                    </span>
                    <span class="flex items-center gap-1 text-gray-600">
                      <FileQuestion class="w-4 h-4" />
                      <span>{{ quiz.questionsNumbers || 0 }} questions</span>
                    </span>
                    <span class="flex items-center gap-1 text-gray-600">
                      <Calendar class="w-4 h-4" />
                      <span>{{ formatDate(quiz.createdAt) }}</span>
                    </span>
                  </template>
                  <template #status>
                  <span :class="['text-xs font-medium px-2 py-1 rounded-full', quiz.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600']">
                    {{ quiz.isPublic ? 'Public' : 'Privé' }}
                  </span>
                  </template>
                  <template #action>
                  <span class="text-sm text-black/50 flex items-center gap-1 font-semibold group-hover:underline group-hover:translate-x-1 transition-all">
                    Voir le quiz
                    <ArrowRight class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  </template>
                  <template #badge>
                    <span v-if="quiz.status === 'pending'" class="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">En attente</span>
                    <span v-else-if="quiz.status === 'published'" class="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">Publié</span>
                    <span v-else-if="quiz.status === 'draft'" class="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">Brouillon</span>
                  </template>
                </QuizCard>
              </div>
            </div>
            <div class="flex justify-end mt-2">
              <router-link
                to="/quiz"
                class="text-primary font-semibold text-base group flex items-center transition-all"
              >
                <span class="transition-colors text-black group-hover:text-primary">Voir tous mes quiz</span>
                <ArrowRight
                  class="transition-colors w-5 h-5 inline-block mr-1 transform transition-transform group-hover:translate-x-1 ml-1 group-hover:text-primary text-black transition-colors"
                />
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </section>
  </MotionLayout>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) #f3f4f6;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 7px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 6px;
}
</style>
