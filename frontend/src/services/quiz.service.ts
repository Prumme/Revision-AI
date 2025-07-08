import { ApiService } from './api.service';

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
    questions?: QuizQuestion[];
    questionsNumbers?: number;
    description?: string;
    isPublic?: boolean;
    media?: string[];
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'published' | 'draft';
    createdAt?: Date;
    updatedAt?: Date;
}

export class QuizService {
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
    static async getQuiz(filters: Record<string, unknown> = {}, pagination: PaginationParams = {}): Promise<PaginatedQuizResponse> {
        const queryParams = this.buildQueryParams({ ...filters, ...pagination });
        const endpoint = `/quizzes${queryParams.length > 0 ? `?${queryParams.join("&")}` : ""}`;
        const response = await ApiService.get<PaginatedQuizResponse>(endpoint);
        return response.data;
    }

    /**
     * Function to get all quizzes with filters (admin/global)
     */
    static async getAllQuizzes(filters: Record<string, unknown> = {}, pagination: PaginationParams = {}): Promise<PaginatedQuizResponse> {
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
        pagination: PaginationParams = {}
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
            const response = await ApiService.post<Quiz>('/quizzes', quiz);
            return response.data;
        } else {
            const formData = new FormData();

            formData.append('userId', String(quiz.userId));
            formData.append('title', String(quiz.title));

            if (quiz.category) formData.append('category', quiz.category);
            if (quiz.questionsNumbers !== undefined) formData.append('questionsNumbers', String(quiz.questionsNumbers));
            if (quiz.description) formData.append('description', quiz.description);
            if (quiz.isPublic !== undefined) formData.append('isPublic', String(quiz.isPublic));

            // Add files
            if (files) {
                files.forEach((file) => {
                    formData.append(`files`, file);
                    console.log(`Added file: ${file.name}`);
                });
            }

            const response = await ApiService.post<Quiz>('/quizzes', formData);
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
     * Récupère périodiquement les mises à jour d'un quiz jusqu'à ce qu'il soit complété ou échoué
     *
     * @param quizId - L'ID du quiz à surveiller
     * @param intervalMs - Intervalle entre les requêtes en millisecondes (défaut: 2000)
     * @param maxAttempts - Nombre maximal de tentatives avant abandon (défaut: 30)
     * @returns Promise resolving to the completed quiz or null if failed
     */
    static async pollQuizUntilComplete(
        quizId: string,
        onStatusChange?: (status: string) => void,
        onError?: (errorMsg: string) => void,
        intervalMs = 2000,
        maxAttempts = 30
    ): Promise<Quiz | null> {
        let attempts = 0;
        let lastStatus = '';

        return new Promise((resolve, reject) => {
            const checkStatus = async () => {
                try {
                    attempts++;
                    const quiz = await this.getQuizById(quizId);

                    if (onStatusChange && quiz.status !== lastStatus) {
                        lastStatus = quiz.status || '';
                        onStatusChange(lastStatus);
                    }

                    if (quiz.status === 'completed') {
                        console.log(`Quiz ${quizId} completed with ${quiz.questions?.length || 0} questions`);
                        resolve(quiz);
                        return;
                    }

                    if (quiz.status === 'failed') {
                        // Gestion du cas File content is too long
                        if (onError) {
                          const msg = quiz.description && quiz.description.includes('File content is too long')
                            ? 'Le fichier est trop volumineux, la génération du quiz a échoué.'
                            : 'La génération du quiz a échoué.';
                          onError(msg);
                        }
                        console.log(`Quiz ${quizId} generation failed`);
                        resolve(null);
                        return;
                    }

                    if (attempts >= maxAttempts) {
                        console.log(`Max polling attempts (${maxAttempts}) reached for quiz ${quizId}`);
                        resolve(quiz);
                        return;
                    }

                    setTimeout(checkStatus, intervalMs);
                } catch (error) {
                    console.error('Error polling quiz status:', error);
                    if (onError) onError('Erreur lors du polling du quiz.');
                    reject(error);
                }
            };

            checkStatus();
        });
    }

    /**
     * Met à jour un quiz existant
     *
     * @param quizId - L'ID du quiz à mettre à jour
     * @param quiz - L'objet quiz contenant les nouvelles données
     * @returns Promise resolving to the updated quiz object
     */
    static async updateQuiz(quizId: string, quiz: Quiz): Promise<Quiz> {
        // Conversion des questions du format frontend vers backend si besoin
        const payload = { ...quiz };
        if (quiz.questions && quiz.questions.length > 0 && quiz.questions[0].question) {
            payload.questions = quiz.questions.map(q => ({
                question: q.question,
                answers: q.answers
            }));
        }
        const response = await ApiService.put<Quiz>(`/quizzes/${quizId}`, payload);
        return response.data;
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
}
