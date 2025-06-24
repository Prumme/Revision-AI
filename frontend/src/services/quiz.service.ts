import { ApiService } from './api.service';

export interface QuizQuestion {
    question: string;
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
    status?: 'pending' | 'published' | 'draft';
    createdAt?: Date;
    updatedAt?: Date;
}

export class QuizService {

    /**
     * Function to get quizzes with optional filters and pagination
     * 
     * @param filters - Optional filters for searching quizzes
     * @param pagination - Optional pagination parameters
     * @returns Promise resolving to a paginated response of quizzes
     */
    static async getQuiz(): Promise<Quiz[]> {
        const response = await ApiService.get<Quiz[]>('/quizzes');
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
}