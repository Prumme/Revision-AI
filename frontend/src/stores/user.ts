import type { User } from "@/types/user";
import type {
  AuthResponse,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
} from "@/types/auth";
import { defineStore } from "pinia";
import { ref } from "vue";
import { API_URL } from "@/config/api";
import { useRouter } from "vue-router";

export const useUserStore = defineStore("user", () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  const getFullName = () => {
    return user?.value?.username;
  };

  function setUser(newUser: User) {
    user.value = newUser;
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function clearUser() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  async function fetchCurrentUser() {
    try {
      // Si pas de token, on ne fait pas la requête
      if (!token.value) {
        clearUser();
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      if (!response.ok) {
        throw new Error("Token invalide");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      clearUser();
      router.push("/login");
    }
  }

  async function updateUser(userData: Partial<User>) {
    try {
      if (!token.value) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  }

  async function register(credentials: RegisterCredentials) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription");
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const { message } = await response.json();
        if (message && message === "Email not verified") {
          throw new Error("Email not verified, please verify your email");
        }
        throw new Error("Erreur lors de la connexion");
      }

      const data: LoginResponse = await response.json();
      setUser(data.user);
      setToken(data.access_token);
      return data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  }

  function logout() {
    clearUser();
    router.push("/login");
  }

  return {
    user,
    token,
    setUser,
    clearUser,
    getFullName,
    register,
    login,
    logout,
    fetchCurrentUser,
    updateUser,
  };
});
