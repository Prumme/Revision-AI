<<<<<<< Updated upstream
import LoginPage from "@/views/authentication/LoginPage.vue";
import RegisterPage from "@/views/authentication/RegisterPage.vue";
import ForgotPassword from "@/views/authentication/ForgotPassword.vue";
import { createRouter, createWebHistory } from "vue-router";
import UserSidenav from "@/components/UserSidenav.vue";
import AboutView from "@/views/AboutView.vue";
import DashboardView from "@/views/DashboardView.vue";
import NotFound from "@/views/errors/NotFound.vue";
=======
import UserSidenav from "@/components/UserSidenav.vue";
import ForgotPassword from "@/views/authentication/ForgotPassword.vue";
import LoginPage from "@/views/authentication/LoginPage.vue";
import RegisterPage from "@/views/authentication/RegisterPage.vue";
import QuizView from "@/views/QuizView.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
>>>>>>> Stashed changes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: UserSidenav,
      children: [
        {
          path: "/",
          name: "Dashboard",
          component: DashboardView,
        },
        {
          path: "/dashboard",
          name: "Dashboard",
          component: DashboardView,
        },
        {
          path: "/documents",
          name: "documents",
          component: DashboardView,
        },
        {
          path: "/quizz",
          name: "quizz",
          component: QuizView,
        },
      ],
    },
    // Authentication routes
    {
      path: "/login",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterPage,
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: ForgotPassword,
    },
<<<<<<< Updated upstream
    {
      path: "/:pathMatch(.*)*",
      name: "404 not found",
      component: NotFound,
    },
=======
>>>>>>> Stashed changes
  ],
});

export default router;
