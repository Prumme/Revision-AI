import LoginPage from '@/views/authentication/LoginPage.vue'
import RegisterPage from '@/views/authentication/RegisterPage.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ForgotPassword from '@/views/authentication/ForgotPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
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
})

export default router
