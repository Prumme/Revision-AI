<script setup lang="ts">
import NavLink from "@/components/buttons/NavLink.vue";
import Dropdown from "@/components/dropdowns/DropdownInput.vue";
import ProfileComponent from "@/components/profile/ProfileComponent.vue";
import { useUserStore } from "@/stores/user";
import {
  ChevronsRightIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  ExternalLinkIcon,
  HandCoinsIcon,
} from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import ToastContainer from "./toasts/ToastContainer.vue";

const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const dropdownRef = ref();
const userStore = useUserStore();
const router = useRouter();

const closeDropdown = () => {
  dropdownRef.value?.closeMenu();
};

// Toggle Sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};
</script>

<template>
  <main class="flex h-screen w-screen font-outfit">
    <ToastContainer />
    <!-- Sidebar Desktop -->
    <nav
      class="hidden md:block relative p-2.5"
      :class="[
        'bg-white text-foreground-alt border border-l border-gray-extralight',
        'h-full',
        'transition-all duration-500 ease-in-out',

        isSidebarOpen ? 'lg:w-92' : 'lg:w-19',
        'w-19',
        isSidebarOpen && 'md:w-32',
      ]"
    >
      <div class="flex flex-col justify-between h-full">
        <!-- Menus -->
        <div class="font-outfit flex flex-col gap-2.5 mt-5 text-black overflow-hidden">
          <div class="flex items-center justify-center">
            <h1
              class="text-xl truncate font-medium text-black font-outfit grow text-left pl-3"
              v-show="isSidebarOpen"
            >
              Revision AI
            </h1>
            <ChevronsRightIcon
              class="h-6 w-6 text-foreground-alt hover:text-primary cursor-pointer transition-all duration-500 ease-in-out"
              :class="isSidebarOpen ? 'rotate-180' : ''"
              @click="toggleSidebar"
            />
          </div>

          <!-- Section principale -->
          <NavLink
            to="/dashboard"
            icon="Home"
            :text="isSidebarOpen ? 'Accueil' : ''"
            :active="true"
            :showText="isSidebarOpen"
          />
          <NavLink
            to="/quiz"
            icon="FileQuestion"
            :text="isSidebarOpen ? 'Quiz' : ''"
            :active="false"
            :showText="isSidebarOpen"
          />
          <NavLink
            to="/documents"
            icon="File"
            :text="isSidebarOpen ? 'Cours' : ''"
            :active="false"
            :showText="isSidebarOpen"
          />
          <NavLink
            to="/subscription"
            icon="Gem"
            :text="isSidebarOpen ? 'Abonnement' : ''"
            :active="false"
            :showText="isSidebarOpen"
          />

          <!-- Section Admin -->
          <div v-if="userStore.isAdmin" class="mt-6">
            <div
              v-if="isSidebarOpen"
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2"
            >
              Administration
            </div>
            <div v-else class="border-t border-gray-200 my-3"></div>
            <div class="flex flex-col gap-2.5">
              <NavLink
                to="/admin/user"
                icon="Users"
                :text="isSidebarOpen ? 'Utilisateurs' : ''"
                :active="false"
                :showText="isSidebarOpen"
              />
              <NavLink
                to="/admin/reports"
                icon="Flag"
                :text="isSidebarOpen ? 'Signalements' : ''"
                :active="false"
                :showText="isSidebarOpen"
              />
              <a
                href="https://dashboard.stripe.com/test/customers"
                target="_blank"
                class="flex items-center gap-5 px-4 py-3 rounded-lg text-sm hover:bg-primary/50 duration-200"
              >
                <HandCoinsIcon class="h-5 w-5" />
                <span v-if="isSidebarOpen" class="flex items-center gap-2">
                  Clients
                  <ExternalLinkIcon class="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </div>

        <!-- Profile Section avec Dropdown -->
        <div class="w-full">
          <Dropdown ref="dropdownRef" position="bottom-left">
            <template #trigger>
              <ProfileComponent :isSidebarOpen="isSidebarOpen" :icon="true" />
            </template>

            <template #menus>
              <ProfileComponent
                :isSidebarOpen="isSidebarOpen"
                :isSidebarCollapsed="isSidebarCollapsed"
                :icon="false"
                class="block px-4 py-4"
              />
              <RouterLink
                to="/profile"
                class="block px-4 py-2 text-gray-light hover:bg-gray-100"
                @click="closeDropdown"
                >Mon profil</RouterLink
              >
              <RouterLink class="block px-4 py-2 text-gray-light hover:bg-gray-100" to="/coming-soon"
                >Boutique</RouterLink
              >
              <RouterLink class="block px-4 py-2 text-gray-light hover:bg-gray-100" to="/coming-soon"
                >Paramètres</RouterLink
              >
              <span
                class="block px-4 py-2 mb-2 text-gray-light hover:bg-gray-100"
                @click="handleLogout"
              >
                <LogOutIcon class="inline-block mr-2 h-4 w-4 text-gray-light" />
                Se déconnecter
              </span>
            </template>
          </Dropdown>
        </div>
      </div>
    </nav>

    <!-- Sidebar Mobile -->
    <nav class="md:hidden block fixed top-10 right-5 w-min h-min rounded-full z-30 bg-white">
      <component
        :is="isSidebarOpen ? XIcon : MenuIcon"
        class="h-6 w-6 text-foreground-alt hover:text-primary cursor-pointer"
        @click="toggleSidebar"
      />
    </nav>

    <!-- Sidebar Mobile Fullscreen -->
    <div
      v-if="isSidebarOpen"
      class="md:hidden fixed top-0 left-0 w-full h-full bg-white bg-opacity-90 z-30 shadow-lg flex flex-col justify-between p-5 transition-all duration-500 ease-in-out"
    >
      <div class="font-outfit flex flex-col gap-4 mt-5 text-black">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-medium text-black">Revision AI</h1>
          <XIcon
            class="h-6 w-6 text-foreground-alt hover:text-primary cursor-pointer"
            @click="toggleSidebar"
          />
        </div>

        <!-- Section principale -->
        <NavLink to="/dashboard" icon="Home" :text="'Accueil'" :active="true" :showText="true" />
        <NavLink to="/quiz" icon="FileQuestion" :text="'Quiz'" :active="false" :showText="true" />
        <NavLink to="/courses" icon="File" :text="'Cours'" :active="false" :showText="true" />

        <!-- Section Admin -->
        <div v-if="userStore.isAdmin" class="mt-6">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
            Administration
          </div>
          <NavLink
            to="/admin/user"
            icon="Users"
            :text="'Utilisateurs'"
            :active="false"
            :showText="true"
          />
        </div>
      </div>

      <!-- Profile Section with Dropdown -->
      <div class="w-full mt-10">
        <Dropdown trigger="">
          <template #trigger>
            <ProfileComponent :isSidebarOpen="isSidebarOpen" :icon="true" />
          </template>

          <template #menus>
            <ProfileComponent
              :isSidebarOpen="isSidebarOpen"
              :icon="false"
              class="block px-4 py-4"
            />
            <a href="/profile" class="block px-4 py-2 text-gray-light hover:bg-gray-100"
              >Mon profil</a
            >
            <a href="#" class="block px-4 py-2 text-gray-light hover:bg-gray-100">Boutique</a>
            <a href="#" class="block px-4 py-2 text-gray-light hover:bg-gray-100">Paramètres</a>
            <span
              class="block px-4 py-2 mb-2 text-gray-light hover:bg-gray-100"
              @click="handleLogout"
            >
              <LogOutIcon class="inline-block mr-2 h-4 w-4 text-gray-light" />
              Se déconnecter
            </span>
          </template>
        </Dropdown>
      </div>
    </div>

    <div class="w-full h-full overflow-scroll bg-background-alt text-foreground pt-10 lg:p-8 p-4">
      <router-view></router-view>
    </div>
  </main>
</template>
