import { API_URL } from "@/config/api";
import type {
  AuthResponse,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
} from "@/types/auth";
import type { User } from "@/types/user";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { QuizService } from "@/services/quiz.service";
import { KpiService } from "@/services/kpi.service";

interface LoginFunctionResponse {
  totpRequired: boolean;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const useUserStore = defineStore("user", () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));
  const quizCount = ref<number>(
    localStorage.getItem("quizCount") ? parseInt(localStorage.getItem("quizCount")!) : 0,
  );
  const averageScore = ref<string>(localStorage.getItem("averageScore") || "0%");
  const totalRevisionTimeFormatted = ref<string>(
    localStorage.getItem("totalRevisionTimeFormatted") || "0m",
  );

  const getFullName = () => {
    return user?.value?.username;
  };

  const isAdmin = computed(() => {
    return user?.value?.role === "admin";
  });

  function setUser(newUser: User) {
    user.value = newUser;
  }

  function setAvatar(newAvatar: string) {
    user.value!.avatar = newAvatar;
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function setSubscriptionTier(newSubscriptionTier: string) {
    user.value!.subscriptionTier = newSubscriptionTier;
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
        // clearUser();
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

  async function fetchCustomerInfo() {
    try {
      if (!token.value) {
        clearUser();
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/subscription/customer`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des informations du client");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des informations du client:", error);
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
    console.log(credentials);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const { message } = await response.json();
        if (message && message === "Un utilisateur avec cet email existe déjà") {
          throw new Error("Un utilisateur avec cet email existe déjà");
        }
        if (message && message === "Un utilisateur avec ce nom d'utilisateur existe déjà") {
          throw new Error("Un utilisateur avec ce nom d'utilisateur existe déjà");
        }
        throw new Error("Erreur lors de l'inscription");
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function login(credentials: LoginCredentials): Promise<LoginFunctionResponse> {
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
          throw new AuthError("Email not verified");
        }
        if (message && message === "Invalid TOTP code") {
          throw new AuthError("Code de vérification invalide");
        }
        if (message && message === "Account blocked") {
          throw new AuthError("Votre compte est bloqué");
        }
        throw new AuthError("Erreur lors de la connexion, veuillez vérifier vos identifiants");
      }

      const data: LoginResponse = await response.json();

      if ("needTOTP" in data) {
        return { totpRequired: true };
      }
      setUser(data.user);
      setToken(data.access_token);
      return { totpRequired: false };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  }

  function logout() {
    clearUser();
    router.push("/login");
  }

  async function fetchQuizCount() {
    if (!user.value) {
      quizCount.value = 0;
      return 0;
    }
    const response = await QuizService.getUserQuizzes(user.value.id || user.value._id);
    const count = response.length;
    quizCount.value = count;
    return count;
  }

  async function fetchKpis() {
    if (!user.value) {
      averageScore.value = "0%";
      totalRevisionTimeFormatted.value = "0m";
      return;
    }
    try {
      const [score, time] = await Promise.all([
        KpiService.getUserAverageScore(user.value.id || user.value._id),
        KpiService.getUserTotalRevisionTime(user.value.id || user.value._id),
      ]);
      averageScore.value = (score || 0) + "%";
      totalRevisionTimeFormatted.value = time || "0m";
      localStorage.setItem("averageScore", averageScore.value);
      localStorage.setItem("totalRevisionTimeFormatted", totalRevisionTimeFormatted.value);
    } catch {
      averageScore.value = "0%";
      totalRevisionTimeFormatted.value = "0m";
    }
  }

  return {
    user,
    token,
    isAdmin,
    setUser,
    clearUser,
    getFullName,
    register,
    login,
    logout,
    fetchCurrentUser,
    fetchCustomerInfo,
    updateUser,
    setAvatar,
    quizCount,
    fetchQuizCount,
    setSubscriptionTier,
    averageScore,
    totalRevisionTimeFormatted,
    fetchKpis,
  };
});
