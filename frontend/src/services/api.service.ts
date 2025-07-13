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
  public static getBaseUrl(): string {
    return API_CONFIG.BASE_URL;
  }
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

    const isFormData = bodyToParse instanceof FormData;
    let body: BodyInit | undefined = undefined;

    if (method !== "GET" && method !== "HEAD" && bodyToParse !== undefined) {
      if (isFormData) {
        delete requestHeaders["Content-Type"];
        body = bodyToParse;
      } else {
        body = JSON.stringify(bodyToParse);
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        ...(body !== undefined ? { body } : {}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data; // data contient tout l'objet d'erreur
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
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

  static async getFile(endpoint: string, requiresAuth = true, headers?: Record<string, string>) {
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

    const response = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
    });

    return response;
  }
}
