import UserSidenav from "@/components/UserSidenav.vue";
import { useUserStore } from "@/stores/user";
import AdminUserView from "@/views/admin/AdminUserView.vue";
import AdminReportView from "@/views/admin/AdminReportView.vue";
import EmailSend from "@/views/authentication/EmailSend.vue";
import ForgotPassword from "@/views/authentication/ForgotPassword.vue";
import LoginPage from "@/views/authentication/LoginPage.vue";
import RegisterPage from "@/views/authentication/RegisterPage.vue";
import VerifyEmail from "@/views/authentication/VerifyEmail.vue";
import CheckoutView from "@/views/CheckoutView.vue";
import DashboardView from "@/views/DashboardView.vue";
import NotFound from "@/views/errors/NotFound.vue";
import LandingPage from "@/views/LandingPage.vue";
import ProfilePage from "@/views/Profile/ProfilePage.vue";
import PublicProfilePage from "@/views/Profile/PublicProfilePage.vue";
import QuizForm from "@/views/quiz/QuizForm.vue";
import QuizList from "@/views/quiz/QuizList.vue";
import QuizDetails from "@/views/quiz/QuizDetails.vue";
import AdminUserDetailView from "@/views/admin/AdminUserDetailView.vue";
import SubscriptionView from "@/views/SubscriptionView.vue";
import { createRouter, createWebHistory } from "vue-router";
import AdminReportDetailView from "@/views/admin/AdminReportDetailView.vue";
import ContactView from "@/views/landing/ContactView.vue";
import LegalView from "@/views/landing/LegalView.vue";
import TermsView from "@/views/landing/TermsView.vue";
import PrivacyView from "@/views/landing/PrivacyView.vue";
import DocumentsView from "@/views/DocumentsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Revision AI",
      component: LandingPage,
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactView,
    },
    {
      path: "/legal",
      name: "legal",
      component: LegalView,
    },
    {
      path: "/terms",
      name: "terms",
      component: TermsView,
    },
    {
      path: "/privacy",
      name: "privacy",
      component: PrivacyView,
    },
    {
      path: "/",
      component: UserSidenav,
      meta: { requiresAuth: true },
      children: [
        {
          path: "/dashboard",
          name: "Dashboard",
          component: DashboardView,
        },
        {
          path: "/documents",
          name: "documents",
          component: DocumentsView,
        },
        {
          path: "/quiz/create",
          name: "quiz-create",
          component: QuizForm,
        },
        {
          path: "/quiz",
          name: "quiz",
          component: QuizList,
        },
        {
          path: "/quiz/:id",
          name: "quiz-detail",
          component: QuizDetails,
        },
        {
          path: "/profile",
          name: "profile",
          component: ProfilePage,
        },
        {
          path: "/profil/:username",
          name: "public-profile",
          component: PublicProfilePage,
        },
        {
          path: "/subscription",
          name: "subscription",
          component: SubscriptionView,
        },
        {
          path: "/subscription/checkout",
          name: "subscription-checkout",
          component: CheckoutView,
        },
        {
          path: "/admin/user",
          name: "admin-users",
          component: AdminUserView,
          meta: { requiresAdmin: true },
        },
        {
          path: "/admin/reports",
          name: "admin-reports",
          component: AdminReportView,
          meta: { requiresAdmin: true },
        },
        {
          path: "/admin/users/:id",
          name: "admin-user",
          component: AdminUserDetailView,
          meta: { requiresAdmin: true },
        },
        {
          path: "/admin/reports/:id",
          name: "admin-report-detail",
          component: AdminReportDetailView,
          meta: { requiresAdmin: true },
        },
      ],
    },
    // Authentication routes
    {
      path: "/login",
      name: "login",
      component: LoginPage,
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterPage,
      meta: { requiresGuest: true },
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: ForgotPassword,
      meta: { requiresGuest: true },
    },
    {
      path: "/auth/verify-email",
      name: "verify-email",
      component: VerifyEmail,
      meta: { requiresGuest: true },
    },
    {
      path: "/email-send",
      name: "email-send",
      component: EmailSend,
      meta: { requiresGuest: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "404 not found",
      component: NotFound,
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const token = localStorage.getItem("token");

  // Tente de charger l'utilisateur s'il y a un token mais pas encore de user
  if (token && !userStore.user) {
    try {
      // On essaie de récupérer les informations de l'utilisateur
      if (!userStore.user) {
        await userStore.fetchCurrentUser();
      }

      // Vérification des permissions admin
      if (to.matched.some((record) => record.meta.requiresAdmin)) {
        if (!userStore.isAdmin) {
          next({ name: "404 not found" });
          return;
        }
      }

      next();
    } catch {
      // Si token invalide, tu peux le supprimer et rediriger
      localStorage.removeItem("token");
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    }
  }

  // Auth required ?
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token)
      return next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    return next();
  }

  // Guest only ?
  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (token) return next({ name: "Dashboard" });
    return next();
  }

  next();
});

export default router;
