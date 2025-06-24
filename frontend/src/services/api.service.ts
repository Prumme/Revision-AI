import { API_CONFIG } from "../config/api.config";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";

interface RequestOptions {
  method: RequestMethod;
  endpoint: string;
  bodyToParse?: unknown;
  requiresAuth?: boolean;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export class ApiService {
  private static getAuthToken(): string | null {
    return localStorage.getItem("token");
  }

  private static async request<T>({
    method,
    endpoint,
    bodyToParse,
    requiresAuth = true,
    headers = {},
  }: RequestOptions): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const requestHeaders = {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...headers,
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    console.log("body", bodyToParse);

    const options: RequestInit = {
      method,
      headers: requestHeaders
    };

    // N'ajouter un body que si ce n'est pas une requête GET ou HEAD
    if (bodyToParse !== undefined && method !== "GET" && method !== "HEAD") {
      if (bodyToParse instanceof FormData) {
        // Si c'est un FormData, supprimer Content-Type pour laisser le navigateur définir la limite multipart
        delete requestHeaders["Content-Type"];
        options.body = bodyToParse;
      } else {
        options.body = JSON.stringify(bodyToParse);
      }
    }

    try {
      const response = await fetch(url, options);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue");
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur API: ${error.message}`);
      }
      throw error;
    }
  }

  // Méthodes utilitaires pour les requêtes courantes
  static async get<T>(endpoint: string, requiresAuth = true, headers?: Record<string, string>) {
    return this.request<T>({ method: "GET", endpoint, requiresAuth, headers });
  }

  static async post<T>(
    endpoint: string,
    body: unknown,
    requiresAuth = true,
    headers?: Record<string, string>,
  ) {
    return this.request<T>({ method: "POST", endpoint, bodyToParse: body, requiresAuth, headers });
  }

  static async put<T>(
    endpoint: string,
    body: unknown,
    requiresAuth = true,
    headers?: Record<string, string>,
  ) {
    return this.request<T>({ method: "PUT", endpoint, bodyToParse: body, requiresAuth, headers });
  }

  static async patch<T>(
    endpoint: string,
    body: unknown,
    requiresAuth = true,
    headers?: Record<string, string>,
  ) {
    return this.request<T>({ method: "PATCH", endpoint, bodyToParse: body, requiresAuth, headers });
  }

  static async delete<T>(endpoint: string, requiresAuth = true, headers?: Record<string, string>) {
    return this.request<T>({ method: "DELETE", endpoint, requiresAuth, headers });
  }
}
