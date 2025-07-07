import axios from 'axios';
import { Quiz } from '../../app/value-objects/Quiz';

const API_URL = process.env.API_URL || 'http://api:3000';

export interface QuizUpdateParams {
    quizId: string;
    questions: Quiz['questions'];
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class QuizApiService {
    /**
     * Met à jour le quiz avec les questions générées
     */
    static async updateQuizWithQuestions({ quizId, questions, status }: QuizUpdateParams): Promise<boolean> {
        try {
            console.log(`Updating quiz ${quizId} with ${questions.length} questions, status: ${status}`);

            // Convertir les questions au format attendu par l'API
            const formattedQuestions = questions.map(q => ({
                q: q.q,
                answers: q.answers.map(a => ({
                    a: a.a,
                    c: a.c
                }))
            }));

            console.log('Formatted questions:', JSON.stringify(formattedQuestions, null, 2));

            // Ne pas ajouter d'en-tête Authorization, aucune vérification JWT
            const response = await axios.put(`${API_URL}/quizzes/${quizId}`, {
                questions: formattedQuestions,
                status
            });

            console.log(`Quiz update response: ${response.status}`);
            return response.status === 200;
        } catch (error: any) {
            console.error('Error updating quiz:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            return false;
        }
    }
}
