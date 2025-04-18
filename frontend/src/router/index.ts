import LoginPage from "@/views/authentication/LoginPage.vue";
import RegisterPage from "@/views/authentication/RegisterPage.vue";
import ForgotPassword from "@/views/authentication/ForgotPassword.vue";
import { createRouter, createWebHistory } from "vue-router";
import UserSidenav from "@/components/UserSidenav.vue";
import AboutView from "@/views/AboutView.vue";
import DashboardView from "@/views/DashboardView.vue";
import NotFound from "@/views/errors/NotFound.vue";

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
          path: "/about",
          name: "about",
          component: AboutView,
        },
      ],
    },
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
    {
      path: "/:pathMatch(.*)*",
      name: "404 not found",
      component: NotFound,
    },
  ],
});

export default router;
