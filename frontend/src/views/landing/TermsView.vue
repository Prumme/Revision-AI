<script setup lang="ts">
import LandingHeader from "@/components/landing/LandingHeader.vue";
import LandingFooter from "@/components/landing/LandingFooter.vue";
import { Motion } from '@motionone/vue';
import { 
  FileText, 
  Users, 
  Shield, 
  CreditCard, 
  RefreshCw, 
  AlertTriangle, 
  Scale, 
  Bot,
  Eye,
  Clock
} from "lucide-vue-next";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";

// Informations de l'entreprise
const companyInfo = {
  name: "RevisionAI SAS",
  address: "242 Rue du Faubourg Saint-Antoine, 75012 Paris, France",
  email: "contact@revision-ai.fr",
  phone: "+33 1 23 45 67 89"
};

const termsSections = [
  {
    icon: FileText,
    title: "Définitions",
    id: "definitions"
  },
  {
    icon: Users,
    title: "Accès au service",
    id: "acces"
  },
  {
    icon: Bot,
    title: "Service IA",
    id: "ia"
  },
  {
    icon: CreditCard,
    title: "Tarifs et paiement",
    id: "tarifs"
  },
  {
    icon: RefreshCw,
    title: "Résiliation",
    id: "resiliation"
  },
  {
    icon: Eye,
    title: "Données personnelles",
    id: "donnees"
  },
  {
    icon: Shield,
    title: "Responsabilités",
    id: "responsabilites"
  },
  {
    icon: AlertTriangle,
    title: "Propriété intellectuelle",
    id: "propriete"
  },
  {
    icon: Scale,
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
            Conditions Générales d'Utilisation et de Vente
          </h1>
          <p class="font-outfit text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Conditions régissant l'utilisation de la plateforme RevisionAI et la vente de nos services d'intelligence artificielle éducative.
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
              v-for="section in termsSections"
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

        <!-- Introduction -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.25, duration: 0.6 }"
        >
          <div class="bg-blue-light rounded-2xl p-6 border-l-4 border-primary">
            <h2 class="font-encode text-2xl font-bold text-black mb-4">Préambule</h2>
            <p class="font-outfit text-gray-700 mb-4">
              Les présentes Conditions Générales d'Utilisation et de Vente (ci-après "CGU/CGV") régissent l'utilisation de la plateforme RevisionAI et l'achat des services proposés par {{ companyInfo.name }}.
            </p>
            <p class="font-outfit text-gray-700">
              L'utilisation de notre service implique l'acceptation pleine et entière des présentes conditions.
            </p>
          </div>
        </Motion>
        
        <!-- Définitions -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.3, duration: 0.6 }"
        >
          <div id="definitions" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Définitions</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div class="grid gap-4">
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">• Société</h3>
                  <p class="font-outfit text-gray-700">{{ companyInfo.name }}, société par actions simplifiée au capital de 10 000 €, dont le siège social est situé {{ companyInfo.address }}.</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">• Service</h3>
                  <p class="font-outfit text-gray-700">La plateforme RevisionAI, service d'intelligence artificielle pour la génération de contenus éducatifs (quiz, fiches de révision, examens blancs).</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">• Utilisateur</h3>
                  <p class="font-outfit text-gray-700">Toute personne physique ou morale utilisant le Service, qu'elle soit inscrite ou non.</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">• Client</h3>
                  <p class="font-outfit text-gray-700">Utilisateur ayant souscrit à un abonnement payant du Service.</p>
                </div>
                <div>
                  <h3 class="font-outfit font-semibold text-black mb-2">• Contenu IA</h3>
                  <p class="font-outfit text-gray-700">Contenu généré par l'intelligence artificielle à partir des demandes et données fournies par l'Utilisateur.</p>
                </div>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Accès au service -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4, duration: 0.6 }"
        >
          <div id="acces" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Accès au service</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">2.1 Conditions d'accès</h3>
                <p class="font-outfit text-gray-700">
                  Le Service est accessible à toute personne âgée d'au moins 13 ans. Les mineurs de moins de 18 ans doivent obtenir l'autorisation de leurs représentants légaux.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">2.2 Inscription</h3>
                <p class="font-outfit text-gray-700">
                  L'inscription nécessite la fourniture d'informations exactes et complètes. L'Utilisateur s'engage à maintenir ces informations à jour.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">2.3 Compte utilisateur</h3>
                <p class="font-outfit text-gray-700">
                  L'Utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités réalisées depuis son compte.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">2.4 Suspension/Résiliation</h3>
                <p class="font-outfit text-gray-700">
                  La Société se réserve le droit de suspendre ou résilier l'accès au Service en cas de non-respect des présentes conditions.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Service IA -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.5, duration: 0.6 }"
        >
          <div id="ia" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Service d'intelligence artificielle</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">3.1 Nature du service</h3>
                <p class="font-outfit text-gray-700">
                  RevisionAI utilise l'intelligence artificielle pour générer du contenu éducatif personnalisé (quiz, fiches de révision, exercices) basé sur les demandes de l'Utilisateur.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">3.2 Limitations de l'IA</h3>
                <p class="font-outfit text-gray-700">
                  L'Utilisateur reconnaît que le contenu généré par IA peut contenir des inexactitudes. Il s'engage à vérifier la pertinence et l'exactitude du contenu avant utilisation.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">3.3 Usage éducatif</h3>
                <p class="font-outfit text-gray-700">
                  Le Service est destiné exclusivement à un usage éducatif et pédagogique. Toute utilisation commerciale ou de revente est interdite.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">3.4 Propriété du contenu généré</h3>
                <p class="font-outfit text-gray-700">
                  L'Utilisateur conserve les droits sur le contenu qu'il génère via le Service, sous réserve du respect des présentes conditions.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Tarifs et paiement -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.6, duration: 0.6 }"
        >
          <div id="tarifs" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Tarifs et paiement</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">4.1 Tarification</h3>
                <p class="font-outfit text-gray-700">
                  Les tarifs sont indiqués en euros toutes taxes comprises et sont disponibles sur notre site. Ils peuvent être modifiés à tout moment avec un préavis de 30 jours.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">4.2 Abonnements</h3>
                <p class="font-outfit text-gray-700">
                  Les abonnements sont facturés d'avance selon la périodicité choisie (mensuelle ou annuelle). Le renouvellement s'effectue automatiquement sauf résiliation.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">4.3 Modalités de paiement</h3>
                <p class="font-outfit text-gray-700">
                  Le paiement s'effectue par carte bancaire via notre prestataire de paiement sécurisé. Le débit a lieu immédiatement après validation de la commande.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">4.4 Défaut de paiement</h3>
                <p class="font-outfit text-gray-700">
                  En cas de défaut de paiement, l'accès au Service sera suspendu après notification. Des frais de recouvrement pourront être appliqués.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">4.5 Remboursement</h3>
                <p class="font-outfit text-gray-700">
                  Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques non fournis sur support matériel dont l'exécution a commencé avec votre accord.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Résiliation -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.7, duration: 0.6 }"
        >
          <div id="resiliation" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <RefreshCw class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Résiliation</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">5.1 Résiliation par l'Utilisateur</h3>
                <p class="font-outfit text-gray-700">
                  L'Utilisateur peut résilier son abonnement à tout moment depuis son espace personnel. La résiliation prend effet à la fin de la période d'abonnement en cours.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">5.2 Résiliation par la Société</h3>
                <p class="font-outfit text-gray-700">
                  La Société peut résilier l'abonnement en cas de manquement aux présentes conditions, avec un préavis de 15 jours sauf faute grave.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">5.3 Conséquences</h3>
                <p class="font-outfit text-gray-700">
                  À la résiliation, l'Utilisateur perd l'accès au Service. Les données peuvent être conservées selon notre Politique de Confidentialité.
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
          :transition="{ delay: 0.8, duration: 0.6 }"
        >
          <div id="donnees" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Eye class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Données personnelles</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">6.1 Collecte et traitement</h3>
                <p class="font-outfit text-gray-700">
                  La collecte et le traitement des données personnelles sont décrits dans notre Politique de Confidentialité, conforme au RGPD.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">6.2 Finalités</h3>
                <p class="font-outfit text-gray-700">
                  Les données sont traitées pour la fourniture du Service, la gestion des abonnements, et l'amélioration de nos services.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">6.3 Droits des utilisateurs</h3>
                <p class="font-outfit text-gray-700">
                  Vous disposez de droits d'accès, rectification, suppression, portabilité et opposition concernant vos données personnelles.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Responsabilités -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.9, duration: 0.6 }"
        >
          <div id="responsabilites" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Responsabilités et garanties</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">7.1 Obligations de la Société</h3>
                <p class="font-outfit text-gray-700">
                  La Société s'engage à fournir le Service avec diligence mais ne garantit pas l'exactitude ou la complétude du contenu généré par l'IA.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">7.2 Limitation de responsabilité</h3>
                <p class="font-outfit text-gray-700">
                  La responsabilité de la Société est limitée au montant des sommes versées par l'Utilisateur au cours des 12 derniers mois.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">7.3 Obligations de l'Utilisateur</h3>
                <p class="font-outfit text-gray-700">
                  L'Utilisateur s'engage à utiliser le Service de manière conforme et à ne pas porter atteinte aux droits de tiers.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">7.4 Force majeure</h3>
                <p class="font-outfit text-gray-700">
                  Aucune partie ne sera responsable des manquements dus à un cas de force majeure au sens de l'article 1218 du Code civil.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Propriété intellectuelle -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 1.0, duration: 0.6 }"
        >
          <div id="propriete" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <AlertTriangle class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Propriété intellectuelle</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">8.1 Droits de la Société</h3>
                <p class="font-outfit text-gray-700">
                  La Société détient tous les droits sur la plateforme, les algorithmes d'IA, et les éléments de l'interface utilisateur.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">8.2 Licence d'utilisation</h3>
                <p class="font-outfit text-gray-700">
                  La Société accorde à l'Utilisateur une licence non exclusive et révocable d'utilisation du Service pour ses besoins personnels.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">8.3 Contenu utilisateur</h3>
                <p class="font-outfit text-gray-700">
                  L'Utilisateur garantit disposer des droits nécessaires sur les contenus qu'il soumet et accorde à la Société une licence d'utilisation pour la fourniture du Service.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">8.4 Contrefaçon</h3>
                <p class="font-outfit text-gray-700">
                  Toute reproduction, représentation ou utilisation non autorisée des éléments du Service constitue une contrefaçon sanctionnée par la loi.
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
          :transition="{ delay: 1.1, duration: 0.6 }"
        >
          <div id="droit" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Scale class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Droit applicable et litiges</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">9.1 Droit applicable</h3>
                <p class="font-outfit text-gray-700">
                  Les présentes CGU/CGV sont régies par le droit français, notamment le Code de la consommation et le Code civil.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">9.2 Résolution amiable</h3>
                <p class="font-outfit text-gray-700">
                  En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">9.3 Médiation</h3>
                <p class="font-outfit text-gray-700">
                  Conformément à l'article L.612-1 du Code de la consommation, le consommateur a le droit de recourir gratuitement à un médiateur de la consommation : <a href="https://www.economie.gouv.fr/mediation-conso" class="text-primary hover:underline" target="_blank">www.economie.gouv.fr/mediation-conso</a>
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">9.4 Juridiction compétente</h3>
                <p class="font-outfit text-gray-700">
                  À défaut de résolution amiable, les tribunaux de Paris seront seuls compétents, sauf dispositions d'ordre public contraires.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Dispositions finales -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 1.2, duration: 0.6 }"
        >
          <div class="bg-blue-light rounded-2xl p-6 border-l-4 border-primary">
            <h2 class="font-encode text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <Clock class="w-6 h-6 text-primary" />
              Dispositions finales
            </h2>
            <div class="space-y-3">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Modification des conditions</h3>
                <p class="font-outfit text-gray-700">
                  La Société se réserve le droit de modifier les présentes conditions. Les utilisateurs seront informés par email au moins 30 jours avant l'entrée en vigueur des modifications.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Divisibilité</h3>
                <p class="font-outfit text-gray-700">
                  Si une clause des présentes conditions s'avérait nulle ou inapplicable, elle serait réputée non écrite sans affecter la validité des autres clauses.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Contact</h3>
                <p class="font-outfit text-gray-700">
                  Pour toute question relative aux présentes conditions : {{ companyInfo.email }}
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
          :transition="{ delay: 1.3, duration: 0.6 }"
        >
          <div class="text-center py-8 border-t border-gray-200">
            <p class="font-outfit text-sm text-gray-600">
              Dernière mise à jour : 13 juillet 2025 - Version 1.0
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
      :transition="{ delay: 1.4, duration: 0.6 }"
    >
      <section class="py-16 bg-blue-light">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <h2 class="font-encode text-3xl md:text-4xl font-bold text-black mb-4">
            Questions sur nos conditions ?
          </h2>
          <p class="font-outfit text-lg text-gray-700 mb-8">
            Notre équipe est disponible pour répondre à toutes vos questions concernant nos conditions d'utilisation et de vente.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/contact">
              <ButtonComponent variant="primary">
                Nous contacter
              </ButtonComponent>
            </RouterLink>
            <RouterLink to="/legal">
              <ButtonComponent variant="outline">
                Mentions légales
              </ButtonComponent>
            </RouterLink>
          </div>
        </div>
      </section>
    </Motion>

    <LandingFooter />
</template>
