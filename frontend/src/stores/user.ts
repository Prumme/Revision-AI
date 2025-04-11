import type { User } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);

  const getFullName = () => {
    return user?.value?.firstname + " " + user?.value?.lastname;
  };

  function setUser(newUser: User) {
    user.value = newUser;
  }

  function clearUser() {
    user.value = null;
  }

  return {
    user,
    setUser,
    clearUser,
    getFullName,
  };
});
