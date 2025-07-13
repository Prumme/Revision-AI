<script setup lang="ts">
import LandingHeader from "@/components/landing/LandingHeader.vue";
import LandingFooter from "@/components/landing/LandingFooter.vue";
import FormCard from "@/components/forms/cards/FormCard.vue";
import InputComponent from "@/components/inputs/InputComponent.vue";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import CalloutComponent from "@/components/callouts/CalloutComponent.vue";
import { ref } from "vue";
import { Mail, MapPin, Phone, Send, MessageCircle, Clock } from "lucide-vue-next";
import { useToastStore } from "@/stores/toast";
import { Motion } from '@motionone/vue';

const { showToast } = useToastStore();

// Form data
const form = ref({
  name: "",
  email: "",
  subject: "",
  message: ""
});

const isLoading = ref(false);
const isSuccess = ref(false);

// Contact info
const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    content: "contact@revision-ai.fr",
    description: "Nous répondons sous 24h"
  },
  {
    icon: Phone,
    title: "Téléphone",
    content: "+33 1 23 45 67 89",
    description: "Du lundi au vendredi, 9h-18h"
  },
  {
    icon: MapPin,
    title: "Adresse",
    content: "242 Rue du Faubourg Saint-Antoine",
    description: "75012 Paris, France"
  }
];

const handleSubmit = async () => {
  if (!form.value.name || !form.value.email || !form.value.subject || !form.value.message) {
    showToast("error", "Veuillez remplir tous les champs");
    return;
  }

  isLoading.value = true;
  
  try {
    // Simuler l'envoi d'email (remplacer par votre API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    isSuccess.value = true;
    showToast("success", "Votre message a été envoyé avec succès !");
    
    // Reset form
    form.value = {
      name: "",
      email: "",
      subject: "",
      message: ""
    };  
  } catch {
    showToast("error", "Une erreur est survenue lors de l'envoi");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
    <LandingHeader />
    
    <!-- Hero Section -->
    <Motion
      v-motion-in-view
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.1, duration: 0.6 }"
    >
      <section class="bg-blue-light py-16 md:py-20">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h1 class="font-encode text-4xl md:text-5xl font-bold text-black mb-6">
            Contactez-nous
          </h1>
          <p class="font-outfit text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Une question, une suggestion ou besoin d'aide ? Notre équipe est là pour vous accompagner dans votre parcours d'apprentissage.
          </p>
        </div>
      </section>
    </Motion>

    <!-- Contact Cards Section -->
    <section class="py-16 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2, duration: 0.6 }"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Motion
              v-for="(contact, index) in contactInfo" 
              :key="contact.title"
              v-motion-in-view
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: 0.3 + index * 0.1, duration: 0.5 }"
            >
              <div class="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition border border-gray-100">
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <component :is="contact.icon" class="w-8 h-8 text-primary" />
                </div>
                <h3 class="font-encode text-xl font-semibold text-black mb-2">
                  {{ contact.title }}
                </h3>
                <p class="font-outfit text-lg font-medium text-black mb-1">
                  {{ contact.content }}
                </p>
                <p class="font-outfit text-sm text-gray-600">
                  {{ contact.description }}
                </p>
              </div>
            </Motion>
          </div>
        </Motion>

        <!-- Contact Form Section -->
        <div class="max-w-4xl mx-auto">
          <Motion
            v-motion-in-view
            :initial="{ opacity: 0, y: 30 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4, duration: 0.6 }"
          >
            <div class="text-center mb-12">
              <h2 class="font-encode text-3xl md:text-4xl font-bold text-black mb-4">
                Envoyez-nous un message
              </h2>
              <p class="font-outfit text-lg text-gray-700">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>
            </div>
          </Motion>

          <Motion
            v-motion-in-view
            :initial="{ opacity: 0, y: 40 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.5, duration: 0.6 }"
          >
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <!-- Formulaire -->
            <Motion
              v-motion-in-view
              :initial="{ opacity: 0, x: -30 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ delay: 0.6, duration: 0.6 }"
            >
              <FormCard>
              <template #title>
                <div class="flex items-center gap-2">
                  <MessageCircle class="w-5 h-5 text-primary" />
                  Votre message
                </div>
              </template>

              <template #content>
                <form @submit.prevent="handleSubmit" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputComponent
                      v-model="form.name"
                      label="Nom complet"
                      placeholder="Votre nom et prénom"
                      type="text"
                      :disabled="isLoading"
                    />
                    <InputComponent
                      v-model="form.email"
                      label="Email"
                      placeholder="votre@email.com"
                      type="email"
                      :disabled="isLoading"
                    />
                  </div>
                  
                  <InputComponent
                    v-model="form.subject"
                    label="Sujet"
                    placeholder="De quoi souhaitez-vous nous parler ?"
                    type="text"
                    :disabled="isLoading"
                  />
                  
                  <InputComponent
                    v-model="form.message"
                    label="Message"
                    placeholder="Décrivez votre demande en détail..."
                    type="textarea"
                    :disabled="isLoading"
                  />

                  <CalloutComponent
                    v-if="isSuccess"
                    variant="info"
                    :icon="Send"
                    message="Votre message a été envoyé avec succès ! Nous vous répondrons bientôt."
                  />

                  <ButtonComponent
                    type="submit"
                    variant="primary"
                    :disabled="isLoading"
                    class="w-full"
                  >
                    <Send class="w-4 h-4 mr-2" />
                    {{ isLoading ? 'Envoi en cours...' : 'Envoyer le message' }}
                  </ButtonComponent>
                </form>
              </template>
            </FormCard>
            </Motion>

            <!-- Informations supplémentaires -->
            <Motion
              v-motion-in-view
              :initial="{ opacity: 0, x: 30 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ delay: 0.7, duration: 0.6 }"
            >
              <div class="space-y-8">
              <div class="bg-blue-light rounded-2xl p-6">
                <h3 class="font-encode text-xl font-semibold text-black mb-4">
                  Foire aux questions
                </h3>
                <p class="font-outfit text-gray-700 mb-4">
                  Avant de nous contacter, consultez notre FAQ qui répond aux questions les plus fréquentes.
                </p>
                <RouterLink to="/#faq">
                  <ButtonComponent variant="outline" size="default">
                    Voir la FAQ
                  </ButtonComponent>
                </RouterLink>
              </div>

              <div class="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <h3 class="font-encode text-xl font-semibold text-black mb-4">
                  Support technique
                </h3>
                <p class="font-outfit text-gray-700 mb-4">
                  Problème technique ? Consultez notre centre d'aide ou contactez directement notre support.
                </p>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Mail class="w-4 h-4 text-primary" />
                    <p class="font-outfit text-sm text-gray-600">
                      support@revision-ai.fr
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock class="w-4 h-4 text-primary" />
                    <p class="font-outfit text-sm text-gray-600">
                      Réponse sous 2h en moyenne
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-2xl p-6">
                <h3 class="font-encode text-xl font-semibold text-black mb-4">
                  Partenariats & Presse
                </h3>
                <p class="font-outfit text-gray-700 mb-4">
                  Vous représentez une école, une entreprise ou un média ? Parlons de collaboration !
                </p>
                <div class="flex items-center gap-2">
                  <Mail class="w-4 h-4 text-primary" />
                  <p class="font-outfit text-sm text-gray-600">
                    partenaires@revision-ai.fr
                  </p>
                </div>
              </div>
              </div>
            </Motion>
            </div>
          </Motion>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <Motion
      v-motion-in-view
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.8, duration: 0.6 }"
    >
      <section class="py-16 bg-blue-light">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <h2 class="font-encode text-3xl md:text-4xl font-bold text-black mb-4">
            Prêt à révolutionner vos révisions ?
          </h2>
          <p class="font-outfit text-lg text-gray-700 mb-8">
            Rejoignez des milliers d'étudiants qui utilisent déjà RevisionAI pour améliorer leurs résultats.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/register">
              <ButtonComponent variant="primary">
                Commencer gratuitement
              </ButtonComponent>
            </RouterLink>
            <RouterLink to="/">
              <ButtonComponent variant="outline">
                En savoir plus
              </ButtonComponent>
            </RouterLink>
          </div>
        </div>
      </section>
    </Motion>

    <LandingFooter />
</template>
