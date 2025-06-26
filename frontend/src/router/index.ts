import UserSidenav from "@/components/UserSidenav.vue";
import ForgotPassword from "@/views/authentication/ForgotPassword.vue";
import LoginPage from "@/views/authentication/LoginPage.vue";
import RegisterPage from "@/views/authentication/RegisterPage.vue";
import DashboardView from "@/views/DashboardView.vue";
import NotFound from "@/views/errors/NotFound.vue";
import LandingPage from "@/views/LandingPage.vue";
import ProfilePage from "@/views/Profile/ProfilePage.vue";
import QuizView from "@/views/QuizView.vue";
import VerifyEmail from "@/views/authentication/VerifyEmail.vue";
import EmailSend from "@/views/authentication/EmailSend.vue";
import AdminUserView from "@/views/admin/AdminUserView.vue";
import { createRouter, createWebHistory } from "vue-router";
import StripePaymentMethodInput from "@/components/inputs/StripePaymentMethodInput.vue";
import DocumentView from "@/views/DocumentView.vue";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Revision AI",
      component: LandingPage,
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
          component: DocumentView,
        },
        {
          path: "/quizz",
          name: "quizz",
          component: QuizView,
        },
        {
          path: "/profile",
          name: "profile",
          component: ProfilePage,
        },
        {
          path: "/admin/user",
          name: "admin-users",
          component: AdminUserView,
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
      path: "/test",
      component: StripePaymentMethodInput,
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

  // Si la route nécessite une authentification
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Si pas de token, redirection vers login
    if (!token) {
      next({ name: "login" });
      return;
    }

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
      // En cas d'erreur (token invalide par exemple)
      next({ name: "login" });
    }
  }
  // Si la route est pour les invités uniquement (login, register, etc.)
  else if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (token) {
      // Si l'utilisateur est déjà connecté, on le redirige vers la page d'accueil
      next({ name: "Dashboard" });
      return;
    }
    next();
  }
  // Pour toutes les autres routes
  else {
    next();
  }
});

export default router;
