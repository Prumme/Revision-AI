import { ApiService } from "./api.service";
import type { UploadedDocument } from "@/types/uploadedDocument.ts";

export interface QuizQuestion {
  question: string;
  answers: Array<{
    a: string;
    c: boolean;
  }>;
}

export interface BackendQuestion {
  q: string;
  answers: Array<{
    a: string;
    c: boolean;
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedQuizResponse {
  data: Quiz[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Quiz {
  id?: string;
  userId: string;
  title: string;
  category?: string;
  questions: QuizQuestion[];
  questionsNumbers?: number;
  description?: string;
  isPublic?: boolean;
  media?: UploadedDocument[];
  status?: "pending" | "processing" | "completed" | "failed" | "published" | "draft";
  createdAt?: Date;
  updatedAt?: Date;
}

export class QuizService {
  public static categories: { label: string; value: string }[] = [
    { label: "Histoire générale", value: "general_history" },
    { label: "Géographie", value: "geography" },
    { label: "Sciences", value: "sciences" },
    { label: "Mathématiques", value: "mathematics" },
    { label: "Littérature", value: "literature" },
    { label: "Culture générale", value: "general_culture" },
    { label: "Géopolitique", value: "geopolitics" },
    { label: "Économie", value: "economy" },
    { label: "Technologie", value: "technology" },
    { label: "Art", value: "art" },
    { label: "Sport", value: "sport" },
    { label: "Musique", value: "music" },
    { label: "Cinéma", value: "cinema" },
    { label: "Télévision", value: "television" },
    { label: "Internet", value: "internet" },
    { label: "Politique", value: "politics" },
    { label: "Société", value: "society" },
    { label: "Philosophie", value: "philosophy" },
    { label: "Religion", value: "religion" },
    { label: "Informatique", value: "informatics" },
    { label: "Vie quotidienne", value: "daily_life" },
    { label: "Autres", value: "other" },
  ];

  static buildQueryParams(filters: Record<string, unknown>): string[] {
    const queryParams: string[] = [];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
    return queryParams;
  }

  /**
   * Function to get quizzes with optional filters and pagination
   */
  static async getQuiz(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedQuizResponse> {
    const queryParams = this.buildQueryParams({ ...filters, ...pagination });
    const endpoint = `/quizzes${queryParams.length > 0 ? `?${queryParams.join("&")}` : ""}`;
    const response = await ApiService.get<PaginatedQuizResponse>(endpoint);
    console.log("response", response);
    return response.data;
  }

  /**
   * Function to get all quizzes with filters (admin/global)
   */
  static async getAllQuizzes(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedQuizResponse> {
    const queryParams = this.buildQueryParams({ ...filters, ...pagination });
    const endpoint = `/quizzes${queryParams.length > 0 ? `?${queryParams.join("&")}` : ""}`;
    const response = await ApiService.get<PaginatedQuizResponse>(endpoint);
    return response.data;
  }

  /**
   * Get quizzes for a user with filters and pagination
   */
  static async getUserQuizzes(
    userId: string,
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedQuizResponse> {
    const queryParams = this.buildQueryParams({ ...filters, ...pagination });
    const endpoint = `/quizzes/user/${userId}${queryParams.length > 0 ? `?${queryParams.join("&")}` : ""}`;
    const response = await ApiService.get<PaginatedQuizResponse>(endpoint);
    return response.data;
  }

  /**
   * Function to create a new quiz
   *
   * @param quiz - The quiz object containing details like title, category, questions, etc.
   * @param files - Optional array of files to be uploaded with the quiz
   * @returns Promise resolving to the created quiz object
   */
  static async createQuiz(quiz: Quiz, files?: File[]): Promise<Quiz> {
    if (!files || files.length === 0) {
      const response = await ApiService.post<Quiz>("/quizzes", quiz);
      return response.data;
    } else {
      const formData = new FormData();

      formData.append("userId", String(quiz.userId));
      formData.append("title", String(quiz.title));

      if (quiz.category) formData.append("category", quiz.category);
      if (quiz.questionsNumbers !== undefined)
        formData.append("questionsNumbers", String(quiz.questionsNumbers));
      if (quiz.description) formData.append("description", quiz.description);
      if (quiz.isPublic !== undefined) formData.append("isPublic", String(quiz.isPublic));

      // Add files
      if (files) {
        files.forEach((file) => {
          formData.append(`files`, file);
          console.log(`Added file: ${file.name}`);
        });
      }

      const response = await ApiService.post<Quiz>("/quizzes", formData);
      return response.data;
    }
  }

  /**
   * Récupère un quiz par son ID
   *
   * @param quizId - L'ID du quiz à récupérer
   * @returns Promise resolving to the quiz object
   */
  static async getQuizById(quizId: string): Promise<Quiz> {
    const response = await ApiService.get<Quiz>(`/quizzes/${quizId}`);
    const quiz = response.data;

    return quiz;
  }

  /**
   * Vérifie si un quiz a des questions générées
   *
   * @param quiz - L'objet quiz à vérifier
   * @returns boolean - True si le quiz a des questions, false sinon
   */
  static hasQuestions(quiz: Quiz): boolean {
    return Array.isArray(quiz.questions) && quiz.questions.length > 0;
  }

  /**
   * Met à jour un quiz existant
   *
   * @param quizId - L'ID du quiz à mettre à jour
   * @param quiz - L'objet quiz contenant les nouvelles données
   * @returns Promise resolving to the updated quiz object
   */
  static async updateQuiz(quizId: string, quiz: Partial<Quiz>): Promise<Quiz> {
    // Conversion des questions du format frontend vers backend si besoin
    const payload = { ...quiz };
    if (quiz.questions && quiz.questions.length > 0 && quiz.questions[0].question) {
      payload.questions = quiz.questions.map((q) => ({
        question: q.question,
        answers: q.answers,
      }));
    }
    const response = await ApiService.put<Quiz>(`/quizzes/${quizId}`, payload);
    return response.data;
  }

  static async getQuizStatusJob(
    quizId: string,
    onMessage: (
      message: { parsingFileProgress: number; status: string },
      close: () => void,
    ) => void, // Callback function to handle incoming messages,
  ): Promise<boolean> {
    try {
      const source = new EventSource(`${ApiService.getBaseUrl()}/quizzes/${quizId}/jobs`);

      return new Promise((resolve, reject) => {
        source.onopen = () => {
          console.log("Connection to server opened.");
          resolve(true);
        };
        source.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);

          if (data.status) {
            onMessage(data, () => {
              console.log("Closing EventSource connection.");
              source.close();
            });
          }
        };
        source.onerror = (error) => {
          console.error("Error in EventSource:", error);
          source.close();
          reject(false);
        };
      });
    } catch (error) {
      console.error("Error in getQuizStatusJob:", error);
      return false;
    }
  }

  /**
   * Compte le nombre de quiz pour un utilisateur
   * @param userId - L'ID de l'utilisateur
   * @returns Promise<{ count: number }>
   */
  static async countByUserId(userId: string): Promise<number> {
    // Appel en tant que paramètre de chemin, pas query param
    const response = await ApiService.get<{ count: number }>(`/quizzes/count/${userId}`);
    return response.data.count;
  }

  static async getUserMedia(userId: string): Promise<string[]> {
    const response = await ApiService.get<string[]>(`/quizzes/media/${userId}`);
    return response.data;
  }
}
