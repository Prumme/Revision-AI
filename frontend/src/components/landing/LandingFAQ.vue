<script setup lang="ts">
import { ref } from "vue";

const faqs = [
  {
    question: "Comment l’IA comprend-elle mes cours ?",
    answer:
      "Notre IA utilise une technologie de reconnaissance avancée (OCR + NLP) pour lire et comprendre le contenu de vos PDF ou images. Elle identifie les notions clés, les définitions, les concepts importants… puis génère un quiz personnalisé adapté à votre niveau.",
  },
  {
    question: "Puis-je utiliser Revision AI sur mobile ?",
    answer:
      "Oui ! La plateforme est 100 % responsive. Vous pouvez importer vos cours, générer des quiz et réviser directement depuis votre smartphone ou tablette. Une app mobile est aussi en préparation.",
  },
  {
    question: "Est-ce que je peux choisir la matière ou le niveau ?",
    answer:
      "Absolument. Dès que votre document est analysé, vous pouvez indiquer la matière ou laisser l’IA la détecter automatiquement. Si vous êtes en Premium, vous pouvez aussi filtrer par chapitre ou difficulté.",
  },
  {
    question: "Combien de quiz puis-je générer par jour ?",
    answer:
      "Avec un compte gratuit, vous avez droit à <b>1 quiz par jour</b>. Les utilisateurs Premium peuvent générer autant de quiz qu’ils le souhaitent, sans limite.",
  },
  {
    question: "Que se passe-t-il si mon fichier est trop lourd ?",
    answer:
      "Les fichiers PDF ou images jusqu’à <b>10 Mo</b> sont acceptés en version gratuite. En version Premium, vous pouvez aller jusqu’à <b>50 Mo</b>. Si besoin, vous pouvez aussi découper un document en plusieurs parties.",
  },
  {
    question: "Est-ce que les questions sont toujours les mêmes ?",
    answer:
      "Non ! Chaque quiz est généré dynamiquement selon le contenu. Même à partir du même cours, vous pouvez obtenir des questions différentes à chaque fois. C’est idéal pour revoir sans s’ennuyer.",
  },
  {
    question: "Est-ce que les rappels sont automatiques ?",
    answer:
      "Oui, si vous êtes en Premium. Le système de rappels intelligents se base sur votre historique de quiz et utilise la <b>répétition espacée</b> pour vous notifier au bon moment avant un oubli.",
  },
  {
    question: "Puis-je suivre ma progression ?",
    answer:
      "Oui ! Vous avez accès à des statistiques simples sur vos quiz : score moyen, taux de réussite par thème, questions ratées à revoir, etc. En version Premium, vous débloquez un tableau de bord complet.",
  },
  {
    question: "Est-ce que je peux partager mes quiz avec des amis ?",
    answer:
      "C’est une fonctionnalité en cours de développement ! Très bientôt, vous pourrez inviter des amis, partager des quiz, ou réviser à plusieurs via des sessions collaboratives.",
  },
];

const openIndex = ref<number | null>(null);

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index;
}
</script>

<template>
  <section id="faq" class="py-16 bg-white">
    <div class="max-w-3xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-encode font-bold text-black text-center mb-12">
        Questions fréquentes
      </h2>
      <div class="rounded-xl shadow bg-white">
        <div
          v-for="(faq, i) in faqs"
          :key="faq.question"
          class="group"
          :class="{ 'bg-pale-yellow': openIndex === i }"
        >
          <button
            class="w-full flex items-center py-5 px-4 font-encode text-lg text-left focus:outline-none transition relative"
            @click="toggle(i)"
            :aria-expanded="openIndex === i"
          >
            <!-- Accent à gauche si ouvert -->
            <span
              v-if="openIndex === i"
              class="absolute left-0 top-0 h-full w-1 rounded bg-primary"
            ></span>
            <span
              :class="[
                'transition-colors',
                openIndex === i ? 'text-primary font-bold pl-3' : 'text-black',
              ]"
            >
              {{ faq.question }}
            </span>
            <span
              class="ml-auto transition-transform duration-300 text-primary text-2xl font-bold"
              :class="openIndex === i ? 'rotate-45' : ''"
              >+</span
            >
          </button>
          <div
            v-if="openIndex === i"
            class="px-4 pb-5 font-outfit text-gray-700 text-base animate-fade-in"
          >
            <span v-html="faq.answer"></span>
          </div>
          <!-- Bordure basse sauf pour la dernière question -->
          <div v-if="i < faqs.length - 1" class="border-b border-gray-200 mx-4"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
