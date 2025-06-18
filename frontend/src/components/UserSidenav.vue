<script setup lang="ts">
import NavLink from "@/components/buttons/NavLink.vue";
import Dropdown from "@/components/dropdowns/DropdownInput.vue";
import ProfileComponent from "@/components/profile/ProfileComponent.vue";
import { ChevronsRightIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-vue-next";
import { ref } from "vue";
import ToastContainer from "./toasts/ToastContainer.vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

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
      class="hidden md:block relative p-5"
      :class="[
        'bg-white text-foreground-alt border border-l border-gray-extralight',
        'h-full',
        'transition-all duration-500 ease-in-out',
        'shadow-lg',
        isSidebarOpen ? 'lg:w-92' : 'lg:w-24',
        'w-24',
        isSidebarOpen && 'md:w-32',
        isSidebarOpen && 'lg:shadow-lg',
      ]"
    >
      <div class="flex flex-col justify-between h-full">
        <!-- Menus -->
        <div class="font-outfit flex flex-col gap-2.5 mt-5 text-black">
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
          <NavLink
            to="/dashboard"
            icon="Home"
            :text="isSidebarOpen ? 'Accueil' : ''"
            :active="true"
            :showText="isSidebarOpen"
          />
          <NavLink
            to="/quizz"
            icon="FileQuestion"
            :text="isSidebarOpen ? 'Quiz' : ''"
            :active="false"
            :showText="isSidebarOpen"
          />
          <NavLink
            to="/courses"
            icon="File"
            :text="isSidebarOpen ? 'Cours' : ''"
            :active="false"
            :showText="isSidebarOpen"
          />
        </div>

        <!-- Profile Section avec Dropdown -->
        <div class="w-full">
          <Dropdown ref="dropdownRef">
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
              <RouterLink class="block px-4 py-2 text-gray-light hover:bg-gray-100" to="#"
                >Boutique</RouterLink
              >
              <RouterLink class="block px-4 py-2 text-gray-light hover:bg-gray-100" to="#"
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
        <NavLink to="/home" icon="Home" :text="'Accueil'" :active="true" :showText="true" />
        <NavLink to="/quizz" icon="FileQuestion" :text="'Quiz'" :active="false" :showText="true" />
        <NavLink to="/courses" icon="File" :text="'Cours'" :active="false" :showText="true" />
      </div>

      <!-- Profile Section with Dropdown -->
      <div class="w-full mt-10">
        <Dropdown>
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

    <div class="w-full h-full overflow-scroll bg-background-alt text-foreground pt-10 lg:p-8">
      <router-view></router-view>
    </div>
  </main>
</template>
