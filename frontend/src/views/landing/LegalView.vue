<script setup lang="ts">
import LandingHeader from "@/components/landing/LandingHeader.vue";
import LandingFooter from "@/components/landing/LandingFooter.vue";
import { Motion } from '@motionone/vue';
import { Building, Globe, Shield, Mail, Phone, Gavel, UserCheck } from "lucide-vue-next";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";

// Données fictives - à remplacer par les vraies informations
const companyInfo = {
  name: "RevisionAI SAS",
  legalForm: "SAS (Société par Actions Simplifiée)",
  capital: "10 000 €",
  address: "242 Rue du Faubourg Saint-Antoine, 75012 Paris, France",
  siret: "123 456 789 00012",
  rcs: "Paris B 123 456 789",
  tva: "FR 00 123 456 789",
  phone: "+33 1 23 45 67 89",
  email: "contact@revision-ai.fr"
};

const hostingInfo = {
  name: "Scaleway",
  address: "8 boulevard de Denain, 75010 Paris",
  phone: "+33 1 84 88 67 06"
};

const legalSections = [
  {
    icon: Building,
    title: "Éditeur du site",
    id: "editeur"
  },
  {
    icon: Globe,
    title: "Hébergement",
    id: "hebergement"
  },
  {
    icon: Shield,
    title: "Propriété intellectuelle",
    id: "propriete"
  },
  {
    icon: UserCheck,
    title: "Données personnelles",
    id: "donnees"
  },
  {
    icon: Gavel,
    title: "Droit applicable",
    id: "droit"
  }
];
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
            Mentions Légales
          </h1>
          <p class="font-outfit text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Informations légales obligatoires concernant le site RevisionAI et son exploitation.
          </p>
        </div>
      </section>
    </Motion>

    <!-- Navigation rapide -->
    <Motion
      v-motion-in-view
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2, duration: 0.6 }"
    >
      <section class="py-12 bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="font-encode text-2xl font-bold text-black text-center mb-8">
            Navigation rapide
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <a
              v-for="section in legalSections"
              :key="section.id"
              :href="`#${section.id}`"
              class="flex flex-col items-center p-4 bg-blue-light rounded-xl hover:bg-primary/10 transition-colors group"
            >
              <component :is="section.icon" class="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span class="font-outfit text-sm text-center text-gray-700 group-hover:text-black">
                {{ section.title }}
              </span>
            </a>
          </div>
        </div>
      </section>
    </Motion>

    <!-- Contenu principal -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 space-y-16">
        
        <!-- Éditeur du site -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.3, duration: 0.6 }"
        >
          <div id="editeur" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Éditeur du site</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">Raison sociale</h3>
                  <p class="font-outfit text-gray-700">{{ companyInfo.name }}</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">Forme juridique</h3>
                  <p class="font-outfit text-gray-700">{{ companyInfo.legalForm }}</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">Capital social</h3>
                  <p class="font-outfit text-gray-700">{{ companyInfo.capital }}</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">SIRET</h3>
                  <p class="font-outfit text-gray-700">{{ companyInfo.siret }}</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">RCS</h3>
                  <p class="font-outfit text-gray-700">{{ companyInfo.rcs }}</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">TVA Intracommunautaire</h3>
                  <p class="font-outfit text-gray-700">{{ companyInfo.tva }}</p>
                </div>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Adresse du siège social</h3>
                <p class="font-outfit text-gray-700">{{ companyInfo.address }}</p>
              </div>
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex items-center gap-2">
                  <Phone class="w-4 h-4 text-primary" />
                  <span class="font-outfit text-gray-700">{{ companyInfo.phone }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Mail class="w-4 h-4 text-primary" />
                  <span class="font-outfit text-gray-700">{{ companyInfo.email }}</span>
                </div>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Directeur de publication</h3>
                <p class="font-outfit text-gray-700">John Doe, Président</p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Hébergement -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4, duration: 0.6 }"
        >
          <div id="hebergement" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Globe class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Hébergement</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Hébergeur</h3>
                <p class="font-outfit text-gray-700">{{ hostingInfo.name }}</p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Adresse</h3>
                <p class="font-outfit text-gray-700">{{ hostingInfo.address }}</p>
              </div>
              <div class="flex items-center gap-2">
                <Phone class="w-4 h-4 text-primary" />
                <span class="font-outfit text-gray-700">{{ hostingInfo.phone }}</span>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Propriété intellectuelle -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.5, duration: 0.6 }"
        >
          <div id="propriete" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Propriété intellectuelle</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Droits d'auteur</h3>
                <p class="font-outfit text-gray-700">
                  L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels) est protégé par les lois en vigueur sur la propriété intellectuelle et appartient à {{ companyInfo.name }} ou à ses partenaires.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Marques</h3>
                <p class="font-outfit text-gray-700">
                  "RevisionAI" est une marque déposée. Toute reproduction non autorisée de cette marque est interdite et constitue une contrefaçon.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Utilisation</h3>
                <p class="font-outfit text-gray-700">
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site est interdite, sauf autorisation écrite préalable de {{ companyInfo.name }}.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Données personnelles -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.6, duration: 0.6 }"
        >
          <div id="donnees" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Données personnelles</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Politique de confidentialité</h3>
                <p class="font-outfit text-gray-700">
                  Le traitement de vos données personnelles est régi par notre Politique de Confidentialité, accessible depuis le pied de page de notre site.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">RGPD</h3>
                <p class="font-outfit text-gray-700">
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits sur vos données personnelles (accès, rectification, suppression, portabilité).
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Contact DPO</h3>
                <p class="font-outfit text-gray-700">
                  Pour exercer vos droits ou pour toute question relative au traitement de vos données : dpo@revision-ai.fr
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Cookies</h3>
                <p class="font-outfit text-gray-700">
                  Notre site utilise des cookies uniquement utiles au bon fonctionnement du site internet afin d'améliorer votre expérience. Vous pouvez gérer vos préférences depuis notre politique de cookies.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Droit applicable -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.7, duration: 0.6 }"
        >
          <div id="droit" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Gavel class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Droit applicable et juridiction</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Droit applicable</h3>
                <p class="font-outfit text-gray-700">
                  Les présentes mentions légales sont régies par le droit français.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Juridiction compétente</h3>
                <p class="font-outfit text-gray-700">
                  En cas de litige, et à défaut de résolution amiable, les tribunaux de Paris seront seuls compétents.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Médiation</h3>
                <p class="font-outfit text-gray-700">
                  Conformément à l'article L.612-1 du Code de la consommation, nous proposons un dispositif de médiation de la consommation. Le médiateur peut être saisi sur la plateforme en ligne : <a href="https://www.economie.gouv.fr/mediation-conso" class="text-primary hover:underline" target="_blank">www.economie.gouv.fr/mediation-conso</a>
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Dernière mise à jour -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.8, duration: 0.6 }"
        >
          <div class="text-center py-8 border-t border-gray-200">
            <p class="font-outfit text-sm text-gray-600">
              Dernière mise à jour : 13 juillet 2025
            </p>
          </div>
        </Motion>
      </div>
    </section>

    <!-- Call to Action -->
    <Motion
      v-motion-in-view
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.9, duration: 0.6 }"
    >
      <section class="py-16 bg-blue-light">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <h2 class="font-encode text-3xl md:text-4xl font-bold text-black mb-4">
            Des questions ?
          </h2>
          <p class="font-outfit text-lg text-gray-700 mb-8">
            Pour toute question concernant ces mentions légales ou notre service, n'hésitez pas à nous contacter.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/contact">
              <ButtonComponent variant="primary">
                Nous contacter
              </ButtonComponent>
            </RouterLink>
            <RouterLink to="/">
              <ButtonComponent variant="outline">
                Retour à l'accueil
              </ButtonComponent>
            </RouterLink>
          </div>
        </div>
      </section>
    </Motion>

    <LandingFooter />
</template>
