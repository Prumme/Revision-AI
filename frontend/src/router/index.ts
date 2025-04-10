import LoginPage from '@/views/authentication/LoginPage.vue'
import RegisterPage from '@/views/authentication/RegisterPage.vue'
import ForgotPassword from '@/views/authentication/ForgotPassword.vue'
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import UserSidenav from "@/components/UserSidenav.vue";
import AboutView from "@/views/AboutView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: UserSidenav,
      children: [
        {
          path: "/",
          name: "home",
          component: HomeView,
        },
        {
          path: "/about",
          name: "about",
          component: AboutView,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
    }
  ],
});

export default router;
