<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToastStore } from "@/stores/toast";
import { useDialogStore } from "@/stores/dialog";
import { useUserStore } from "@/stores/user";
import MotionLayout from "@/components/layouts/MotionLayout.vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import DropdownInput from "@/components/dropdowns/DropdownInput.vue";
import AvatarComponent from "@/components/profile/avatar/AvatarComponent.vue";
import QuizCard from "@/components/cards/QuizCard.vue";
import { CalendarIcon, BookOpen, MoreVertical, Home } from "lucide-vue-next";
import { ApiService } from "@/services/api.service";
import type { PublicProfileData, User } from "@/types/user";
import type { Quiz } from "@/types/quiz";
import { formatDateLong } from "@/helpers/dateFormat";
import caracterBlueImage from "@/assets/caracters/caracterBlue.webp";

const route = useRoute();
const router = useRouter();
const { showToast } = useToastStore();
const dialogStore = useDialogStore();
const userStore = useUserStore();

const isLoading = ref(true);
const error = ref("");
const profileData = ref<PublicProfileData | null>(null);

const username = computed(() => route.params.username as string);
const currentUser = computed(() => userStore.user);

const fetchPublicProfile = async () => {
  try {
    isLoading.value = true;
    error.value = "";
    const response = await ApiService.get(`/users/profile/${username.value}`);
    profileData.value = response.data;
  } catch (err) {
    console.error("Erreur lors du chargement du profil:", err);
    error.value = "Impossible de charger le profil utilisateur";
    showToast("error", "Erreur lors du chargement du profil");
  } finally {
    isLoading.value = false;
  }
};

const handleReport = (user: User) => {
  dialogStore.showReport({
    userId: user.id,
    userName: user.username,
  });
};

const handleQuizClick = (quiz: Quiz) => {
  router.push(`/quiz/${quiz.id}`);
};

const goToMyProfile = () => {
  if (currentUser.value) {
    router.push(`/profil/${currentUser.value.username}`);
  }
};

// Watcher pour refetcher les données quand le nom d'utilisateur change
watch(
  () => route.params.username,
  (newUsername, oldUsername) => {
    if (newUsername && newUsername !== oldUsername) {
      fetchPublicProfile();
    }
  },
  { immediate: false },
);

onMounted(() => {
  fetchPublicProfile();
});
</script>

<template>
  <MotionLayout>
    <section class="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <!-- Image du caractère bleu -->
          <div class="w-32 h-32 flex items-center justify-center">
            <img
              :src="caracterBlueImage"
              alt="Caractère bleu"
              class="w-full h-full object-contain"
            />
          </div>

          <!-- Titre d'erreur -->
          <div class="text-center">
            <h2 class="font-outfit text-3xl font-bold text-gray-900 mb-4">
              Utilisateur non trouvé
            </h2>
            <p class="text-lg text-gray-600 mb-8">Cet utilisateur n'existe pas ou a été supprimé</p>
          </div>

          <!-- Boutons d'action -->
          <div class="flex gap-4">
            <ButtonComponent @click="router.push('/dashboard')" variant="primary">
              <Home class="w-4 h-4 mr-2" />
              Retour à l'accueil
            </ButtonComponent>

            <ButtonComponent v-if="currentUser" @click="goToMyProfile" variant="secondary">
              Voir mon profil
            </ButtonComponent>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profileData">
        <!-- Header Section -->
        <div class="text-center mb-8">
          <div class="flex flex-col items-center gap-4 relative">
            <!-- Dropdown de signalement -->
            <div class="absolute top-0 right-0" @click.stop>
              <DropdownInput position="top-right">
                <template #trigger>
                  <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical class="w-5 h-5 text-gray-600" />
                  </button>
                </template>
                <template #menus>
                  <div class="py-1">
                    <button
                      @click="handleReport(profileData.user)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Signaler cet utilisateur
                    </button>
                  </div>
                </template>
              </DropdownInput>
            </div>

            <!-- Avatar -->
            <AvatarComponent
              :user="{
                avatar: profileData.user.avatar,
                username: profileData.user.username,
              }"
              size="full"
            />

            <!-- User Info -->
            <div>
              <h1 class="font-outfit text-4xl font-extrabold text-black mb-2">
                {{ profileData.user.username }}
              </h1>
              <p v-if="profileData.user.bio" class="font-outfit text-lg text-gray-600 mb-4">
                {{ profileData.user.bio }}
              </p>
              <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
                <CalendarIcon class="w-4 h-4" />
                <span>Membre depuis {{ formatDateLong(profileData.user.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
            <BookOpen class="w-8 h-8 text-primary mx-auto mb-2" />
            <div class="text-2xl font-bold text-black">{{ profileData.quizzes.length }}</div>
            <div class="text-sm text-gray-600">
              Quiz{{ profileData.quizzes.length > 1 ? "s" : "" }} créé{{
                profileData.quizzes.length > 1 ? "s" : ""
              }}
            </div>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
            <CalendarIcon class="w-8 h-8 text-primary mx-auto mb-2" />
            <div class="text-2xl font-bold text-black">
              {{ formatDateLong(profileData.user.createdAt) }}
            </div>
            <div class="text-sm text-gray-600">Date d'inscription</div>
          </div>
        </div>

        <!-- Quiz Section -->
        <FormCard>
          <template #title> Quiz publics de {{ profileData.user.username }} </template>
          <template #content>
            <div v-if="profileData.quizzes.length === 0" class="text-center py-8">
              <BookOpen class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500 text-lg">Aucun quiz public disponible</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuizCard
                v-for="quiz in profileData.quizzes"
                :key="quiz.id"
                :quiz="quiz"
                :max-description-length="80"
                @click="handleQuizClick(quiz)"
              />
            </div>
          </template>
        </FormCard>
      </div>
    </section>
  </MotionLayout>
</template>

<style scoped>
.quiz-card {
  transition: transform 0.2s ease-in-out;
}

.quiz-card:hover {
  transform: translateY(-2px);
}
</style>
