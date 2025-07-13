<script setup lang="ts">
import LandingHeader from "@/components/landing/LandingHeader.vue";
import LandingFooter from "@/components/landing/LandingFooter.vue";
import { Motion } from '@motionone/vue';
import { 
  Shield, 
  Database, 
  Lock, 
  Users, 
  Calendar, 
  Globe, 
  Eye, 
  UserCheck,
  Cookie,
  Settings,
  AlertCircle,
  Mail,
  KeyRound,
  User,
  MapPin,
  CreditCard,
  Bot,  
  Target,
  Euro,
  MessageSquare,
  Scale,
  CheckCircle,
  Building,
  Cloud,
  FileText,
  Edit,
  Trash2,
  Package,
  Pause,
  X,
  RotateCcw,
  Siren,
  Clock
} from "lucide-vue-next";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";
import { RouterLink } from "vue-router";

// Informations de l'entreprise
const companyInfo = {
  name: "RevisionAI SAS",
  address: "242 Rue du Faubourg Saint-Antoine, 75012 Paris, France",
  email: "contact@revision-ai.fr",
  dpoEmail: "dpo@revision-ai.fr",
  phone: "+33 1 23 45 67 89"
};

const privacySections = [
  {
    icon: Shield,
    title: "Responsable de traitement",
    id: "responsable"
  },
  {
    icon: Database,
    title: "Données collectées",
    id: "donnees-collectees"
  },
  {
    icon: Eye,
    title: "Finalités",
    id: "finalites"
  },
  {
    icon: Lock,
    title: "Bases légales",
    id: "bases-legales"
  },
  {
    icon: Users,
    title: "Destinataires",
    id: "destinataires"
  },
  {
    icon: Calendar,
    title: "Durées de conservation",
    id: "durees"
  },
  {
    icon: Globe,
    title: "Transferts hors UE",
    id: "transferts"
  },
  {
    icon: UserCheck,
    title: "Vos droits",
    id: "droits"
  },
  {
    icon: Settings,
    title: "Sécurité",
    id: "securite"
  },
  {
    icon: Cookie,
    title: "Cookies",
    id: "cookies"
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
            Politique de Confidentialité
          </h1>
          <p class="font-outfit text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Protection et traitement de vos données personnelles sur la plateforme RevisionAI, conforme au RGPD et à la législation française.
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
              v-for="section in privacySections"
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
            <h2 class="font-encode text-2xl font-bold text-black mb-4">Introduction</h2>
            <p class="font-outfit text-gray-700 mb-4">
              La protection de vos données personnelles est une priorité pour {{ companyInfo.name }}. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos données personnelles.
            </p>
            <p class="font-outfit text-gray-700">
              Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la loi française "Informatique et Libertés".
            </p>
          </div>
        </Motion>
        
        <!-- Responsable de traitement -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.3, duration: 0.6 }"
        >
          <div id="responsable" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Responsable de traitement</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Identité du responsable</h3>
                <p class="font-outfit text-gray-700">
                  {{ companyInfo.name }}, société par actions simplifiée au capital de 10 000 €
                </p>
                <p class="font-outfit text-gray-700">
                  Siège social : {{ companyInfo.address }}
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Délégué à la Protection des Données (DPO)</h3>
                <p class="font-outfit text-gray-700">
                  Pour toute question relative à la protection de vos données personnelles :
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <Mail class="w-4 h-4 text-primary" />
                  <span class="font-outfit text-gray-700">{{ companyInfo.dpoEmail }}</span>
                </div>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Contact</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Mail class="w-4 h-4 text-primary" />
                    <span class="font-outfit text-gray-700">{{ companyInfo.email }}</span>
                  </div>
                  <p class="font-outfit text-gray-700">{{ companyInfo.phone }}</p>
                </div>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Données collectées -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4, duration: 0.6 }"
        >
          <div id="donnees-collectees" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Database class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Données personnelles collectées</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-6">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-3 flex items-center gap-2">
                  <KeyRound class="w-5 h-5 text-primary" />
                  Données d'identification
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li>Adresse email (obligatoire)</li>
                  <li>Nom d'utilisateur (obligatoire)</li>
                  <li>Prénom et nom (optionnel)</li>
                  <li>Mot de passe (chiffré)</li>
                </ul>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-3 flex items-center gap-2">
                  <User class="w-5 h-5 text-primary" />
                  Données de profil
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li>Photo de profil (optionnel)</li>
                  <li>Biographie (optionnel)</li>
                  <li>Préférences d'utilisation</li>
                </ul>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-3 flex items-center gap-2">
                  <MapPin class="w-5 h-5 text-primary" />
                  Données d'adresse
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li>Adresse postale (optionnel)</li>
                  <li>Ville et code postal (optionnel)</li>
                  <li>Pays (optionnel)</li>
                </ul>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-3 flex items-center gap-2">
                  <CreditCard class="w-5 h-5 text-primary" />
                  Données de paiement
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li>Identifiant client Stripe (customerId)</li>
                  <li>Historique des abonnements</li>
                  <li>Statut de l'abonnement</li>
                </ul>
                <p class="font-outfit text-sm text-gray-600 mt-2 italic">
                  Note : Les données bancaires sont traitées exclusivement par Stripe et ne sont jamais stockées sur nos serveurs.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-3 flex items-center gap-2">
                  <Bot class="w-5 h-5 text-primary" />
                  Données d'utilisation du service IA
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li>Quiz créés et leurs métadonnées</li>
                  <li>Contenus soumis pour génération IA</li>
                  <li>Historique d'utilisation du service</li>
                </ul>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Finalités -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.5, duration: 0.6 }"
        >
          <div id="finalites" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Eye class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Finalités du traitement</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div class="grid gap-4">
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Target class="w-5 h-5 text-primary" />
                    Fourniture du service
                  </h3>
                  <p class="font-outfit text-gray-700">Création et gestion de votre compte, accès à la plateforme, génération de contenus éducatifs par IA.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Euro class="w-5 h-5 text-primary" />
                    Gestion des abonnements
                  </h3>
                  <p class="font-outfit text-gray-700">Traitement des paiements, gestion de la facturation, suivi des abonnements.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <MessageSquare class="w-5 h-5 text-primary" />
                    Communication
                  </h3>
                  <p class="font-outfit text-gray-700">Envoi d'emails transactionnels, notifications de service, support client.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Shield class="w-5 h-5 text-primary" />
                    Sécurité
                  </h3>
                  <p class="font-outfit text-gray-700">Prévention des fraudes, authentification, protection du service.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Scale class="w-5 h-5 text-primary" />
                    Obligations légales
                  </h3>
                  <p class="font-outfit text-gray-700">Respect des obligations comptables, fiscales et réglementaires françaises.</p>
                </div>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Bases légales -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.6, duration: 0.6 }"
        >
          <div id="bases-legales" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Bases légales du traitement</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <FileText class="w-5 h-5 text-primary" />
                  Exécution du contrat (Art. 6.1.b RGPD)
                </h3>
                <p class="font-outfit text-gray-700">
                  Traitement nécessaire à l'exécution du contrat de service : création de compte, fourniture du service d'IA éducative, gestion des abonnements.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Scale class="w-5 h-5 text-primary" />
                  Obligation légale (Art. 6.1.c RGPD)
                </h3>
                <p class="font-outfit text-gray-700">
                  Conservation des données comptables (10 ans), respect des obligations fiscales françaises, lutte contre la fraude.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Destinataires -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.7, duration: 0.6 }"
        >
          <div id="destinataires" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Destinataires des données</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Building class="w-5 h-5 text-primary" />
                  Personnel autorisé de RevisionAI
                </h3>
                <p class="font-outfit text-gray-700">
                  Nos employés et collaborateurs dans la stricte limite de leurs attributions (support, développement, administration).
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <CreditCard class="w-5 h-5 text-primary" />
                  Stripe (Prestataire de paiement)
                </h3>
                <p class="font-outfit text-gray-700">
                  Pour le traitement sécurisé des paiements et la gestion des abonnements. Stripe est certifié PCI DSS et conforme RGPD.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Cloud class="w-5 h-5 text-primary" />
                  Scaleway (Hébergement)
                </h3>
                <p class="font-outfit text-gray-700">
                  Notre hébergeur français pour le stockage et le traitement des données sur des serveurs basés en France.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Bot class="w-5 h-5 text-primary" />
                  Services d'IA
                </h3>
                <p class="font-outfit text-gray-700">
                  Fournisseurs d'intelligence artificielle pour la génération de contenus éducatifs (uniquement les contenus soumis, jamais les données personnelles d'identification).
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Mail class="w-5 h-5 text-primary" />
                  Services d'emailing
                </h3>
                <p class="font-outfit text-gray-700">
                  Pour l'envoi des emails transactionnels et de support (adresse email uniquement).
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Scale class="w-5 h-5 text-primary" />
                  Autorités compétentes
                </h3>
                <p class="font-outfit text-gray-700">
                  En cas d'obligation légale ou de demande judiciaire : CNIL, autorités fiscales, forces de l'ordre.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Durées de conservation -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.8, duration: 0.6 }"
        >
          <div id="durees" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Durées de conservation</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div class="grid gap-4">
                <div class="flex justify-between items-start p-4 bg-white rounded-lg">
                  <div>
                    <h3 class="font-outfit font-semibold text-black mb-1">Comptes actifs</h3>
                    <p class="font-outfit text-gray-700">Données conservées tant que le compte est actif</p>
                  </div>
                  <span class="font-outfit font-bold text-primary">Durée du contrat</span>
                </div>
                <div class="flex justify-between items-start p-4 bg-white rounded-lg">
                  <div>
                    <h3 class="font-outfit font-semibold text-black mb-1">Comptes supprimés</h3>
                    <p class="font-outfit text-gray-700">Anonymisation immédiate des données personnelles</p>
                  </div>
                  <span class="font-outfit font-bold text-primary">Immédiat</span>
                </div>
                <div class="flex justify-between items-start p-4 bg-white rounded-lg">
                  <div>
                    <h3 class="font-outfit font-semibold text-black mb-1">Données comptables</h3>
                    <p class="font-outfit text-gray-700">Factures et données de paiement (obligation légale française)</p>
                  </div>
                  <span class="font-outfit font-bold text-primary">10 ans</span>
                </div>
                <div class="flex justify-between items-start p-4 bg-white rounded-lg">
                  <div>
                    <h3 class="font-outfit font-semibold text-black mb-1">Logs techniques</h3>
                    <p class="font-outfit text-gray-700">Journaux de connexion et d'accès</p>
                  </div>
                  <span class="font-outfit font-bold text-primary">13 mois</span>
                </div>
                <div class="flex justify-between items-start p-4 bg-white rounded-lg">
                  <div>
                    <h3 class="font-outfit font-semibold text-black mb-1">Cookies</h3>
                    <p class="font-outfit text-gray-700">Selon le type de cookie (1 mois à 13 mois maximum)</p>
                  </div>
                  <span class="font-outfit font-bold text-primary">Variable</span>
                </div>
                <div class="flex justify-between items-start p-4 bg-white rounded-lg">
                  <div>
                    <h3 class="font-outfit font-semibold text-black mb-1">Données d'export</h3>
                    <p class="font-outfit text-gray-700">Fichiers de portabilité des données</p>
                  </div>
                  <span class="font-outfit font-bold text-primary">30 jours</span>
                </div>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Transferts hors UE -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.9, duration: 0.6 }"
        >
          <div id="transferts" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Globe class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Transferts hors Union Européenne</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <MapPin class="w-5 h-5 text-primary" />
                  Hébergement en France
                </h3>
                <p class="font-outfit text-gray-700">
                  Vos données sont principalement hébergées en France par Scaleway, garantissant le respect du droit européen.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Globe class="w-5 h-5 text-primary" />
                  Services tiers hors UE
                </h3>
                <p class="font-outfit text-gray-700">
                  Certains services peuvent impliquer des transferts vers des pays tiers (États-Unis notamment) :
                </p>
                <ul class="font-outfit text-gray-700 mt-2 space-y-1 list-disc list-inside ml-4">
                  <li><strong>Stripe :</strong> Traitement des paiements - Décision d'adéquation et clauses contractuelles standard</li>
                  <li><strong>Services d'IA :</strong> Uniquement les contenus soumis pour génération (jamais les données d'identification)</li>
                  <li><strong>Services d'emailing :</strong> Envoi d'emails transactionnels avec garanties de protection</li>
                </ul>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Shield class="w-5 h-5 text-primary" />
                  Garanties de protection
                </h3>
                <p class="font-outfit text-gray-700">
                  Tous les transferts hors UE sont encadrés par des mécanismes de protection appropriés : clauses contractuelles standard de la Commission européenne, certifications, décisions d'adéquation.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Vos droits -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 1.0, duration: 0.6 }"
        >
          <div id="droits" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Vos droits sur vos données</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <p class="font-outfit text-gray-700 mb-4">
                Conformément au RGPD et à la loi "Informatique et Libertés", vous disposez des droits suivants :
              </p>
              <div class="grid gap-4">
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Eye class="w-5 h-5 text-primary" />
                    Droit d'accès (Art. 15 RGPD)
                  </h3>
                  <p class="font-outfit text-gray-700">Consulter les données que nous détenons sur vous et obtenir des informations sur leur traitement.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Edit class="w-5 h-5 text-primary" />
                    Droit de rectification (Art. 16 RGPD)
                  </h3>
                  <p class="font-outfit text-gray-700">Corriger les données inexactes ou incomplètes directement depuis votre espace personnel.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Trash2 class="w-5 h-5 text-primary" />
                    Droit à l'effacement (Art. 17 RGPD)
                  </h3>
                  <p class="font-outfit text-gray-700">Supprimer votre compte et vos données personnelles (anonymisation immédiate implémentée).</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Package class="w-5 h-5 text-primary" />
                    Droit à la portabilité (Art. 20 RGPD)
                  </h3>
                  <p class="font-outfit text-gray-700">Récupérer vos données dans un format structuré (fonction d'export disponible dans votre compte).</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <Pause class="w-5 h-5 text-primary" />
                    Droit à la limitation (Art. 18 RGPD)
                  </h3>
                  <p class="font-outfit text-gray-700">Demander la restriction temporaire du traitement de vos données.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <X class="w-5 h-5 text-primary" />
                    Droit d'opposition (Art. 21 RGPD)
                  </h3>
                  <p class="font-outfit text-gray-700">Vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.</p>
                </div>
                <div class="border-l-4 border-primary pl-4">
                  <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                    <RotateCcw class="w-5 h-5 text-primary" />
                    Retrait du consentement
                  </h3>
                  <p class="font-outfit text-gray-700">Retirer votre consentement à tout moment pour les traitements basés sur cette base légale.</p>
                </div>
              </div>
              <div class="bg-blue-light rounded-lg p-4 mt-6">
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Mail class="w-5 h-5 text-primary" />
                  Comment exercer vos droits
                </h3>
                <p class="font-outfit text-gray-700 mb-2">
                  Pour exercer ces droits, contactez-nous :
                </p>
                <ul class="font-outfit text-gray-700 space-y-1">
                  <li>• Email : {{ companyInfo.dpoEmail }}</li>
                  <li>• Ou directement depuis votre espace personnel pour certains droits</li>
                </ul>
                <p class="font-outfit text-sm text-gray-600 mt-3 italic">
                  Réponse sous 1 mois maximum. Une pièce d'identité pourra être demandée pour vérifier votre identité.
                </p>
              </div>
              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <AlertCircle class="w-5 h-5 text-yellow-600" />
                  Droit de réclamation
                </h3>
                <p class="font-outfit text-gray-700">
                  Vous avez le droit d'introduire une réclamation auprès de la CNIL si vous estimez que le traitement de vos données ne respecte pas la réglementation : <a href="https://www.cnil.fr" class="text-primary hover:underline" target="_blank">www.cnil.fr</a>
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Sécurité -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 1.1, duration: 0.6 }"
        >
          <div id="securite" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Sécurité des données</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Lock class="w-5 h-5 text-primary" />
                  Mesures techniques
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                  <li>Chiffrement des mots de passe (hachage sécurisé)</li>
                  <li>Authentification forte et gestion des sessions</li>
                  <li>Sauvegardes régulières et chiffrées</li>
                  <li>Surveillance et détection des intrusions</li>
                </ul>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Siren class="w-5 h-5 text-primary" />
                  Notification de violation
                </h3>
                <p class="font-outfit text-gray-700">
                  En cas de violation de données susceptible de présenter un risque pour vos droits et libertés, nous vous en informerons dans les meilleurs délais conformément à l'article 34 du RGPD.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Cookies -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 1.2, duration: 0.6 }"
        >
          <div id="cookies" class="scroll-mt-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Cookie class="w-6 h-6 text-primary" />
              </div>
              <h2 class="font-encode text-3xl font-bold text-black">Cookies et traceurs</h2>
            </div>
            <div class="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Cookie class="w-5 h-5 text-primary" />
                  Qu'est-ce qu'un cookie ?
                </h3>
                <p class="font-outfit text-gray-700">
                  Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site internet. Il permet de reconnaître votre navigateur et de mémoriser certaines informations.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <CheckCircle class="w-5 h-5 text-primary" />
                  Cookies essentiels (sans consentement)
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li><strong>Authentification :</strong> Maintien de votre session de connexion</li>
                  <li><strong>Sécurité :</strong> Protection contre les attaques CSRF</li>
                  <li><strong>Fonctionnement :</strong> Mémorisation de vos préférences de langue</li>
                </ul>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2 flex items-center gap-2">
                  <Clock class="w-5 h-5 text-primary" />
                  Durée de conservation
                </h3>
                <ul class="font-outfit text-gray-700 space-y-1 list-disc list-inside ml-4">
                  <li><strong>Cookies de session :</strong> Supprimés à la fermeture du navigateur</li>
                  <li><strong>Cookies d'authentification :</strong> 30 jours maximum</li>
                </ul>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Modifications -->
        <Motion
          v-motion-in-view
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 1.3, duration: 0.6 }"
        >
          <div class="bg-blue-light rounded-2xl p-6 border-l-4 border-primary">
            <h2 class="font-encode text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <AlertCircle class="w-6 h-6 text-primary" />
              Modifications de cette politique
            </h2>
            <div class="space-y-3">
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Évolution de la politique</h3>
                <p class="font-outfit text-gray-700">
                  Cette politique de confidentialité peut être modifiée pour refléter les changements dans nos pratiques ou la réglementation applicable.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Information des utilisateurs</h3>
                <p class="font-outfit text-gray-700">
                  Toute modification substantielle vous sera notifiée par email et/ou via une notification sur la plateforme au moins 30 jours avant son entrée en vigueur.
                </p>
              </div>
              <div>
                <h3 class="font-outfit font-semibold text-black mb-2">Historique des versions</h3>
                <p class="font-outfit text-gray-700">
                  Les versions précédentes de cette politique sont archivées et disponibles sur demande.
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
          :transition="{ delay: 1.4, duration: 0.6 }"
        >
          <div class="text-center py-8 border-t border-gray-200">
            <p class="font-outfit text-sm text-gray-600">
              Dernière mise à jour : 13 juillet 2025 - Version 1.0
            </p>
            <p class="font-outfit text-xs text-gray-500 mt-2">
              Politique conforme au RGPD (UE) 2016/679 et à la loi française n°78-17 "Informatique et Libertés"
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
      :transition="{ delay: 1.5, duration: 0.6 }"
    >
      <section class="py-16 bg-blue-light">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <h2 class="font-encode text-3xl md:text-4xl font-bold text-black mb-4">
            Questions sur vos données ?
          </h2>
          <p class="font-outfit text-lg text-gray-700 mb-8">
            Notre équipe et notre DPO sont à votre disposition pour répondre à toutes vos questions concernant la protection de vos données personnelles.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/contact">
              <ButtonComponent variant="primary">
                Nous contacter
              </ButtonComponent>
            </RouterLink>
            <RouterLink to="/terms">
              <ButtonComponent variant="outline">
                CGU et CGV
              </ButtonComponent>
            </RouterLink>
          </div>
        </div>
      </section>
    </Motion>

    <LandingFooter />
</template>
