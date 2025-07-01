import { QuizService, type Quiz } from '@/services/quiz.service'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useQuizLoadingStore = defineStore('quizLoading', () => {
    const isLoading = ref(false)
    const currentQuizId = ref<string | null>(null)
    const quizStatus = ref<'pending' | 'processing' | 'completed' | 'failed' | 'published' | 'draft' | null>(null)
    const pollingInterval = ref<number | null>(null)

    const loadingMessage = computed(() => {
        switch (quizStatus.value) {
            case 'pending':
                return 'Préparation de votre quiz...'
            case 'processing':
                return 'Génération des questions en cours...'
            case 'completed':
                return 'Votre quiz est prêt!'
            case 'failed':
                return 'La génération a échoué. Veuillez réessayer.'
            default:
                return 'La génération de votre quiz est en cours...'
        }
    })

    function startLoading(quizId?: string) {
        isLoading.value = true
        if (quizId) {
            currentQuizId.value = quizId
            quizStatus.value = 'pending'
            startPolling()

            if (quizId) {
                QuizService.pollQuizUntilComplete(quizId, (status: 'pending' | 'processing' | 'completed' | 'failed' | 'published' | 'draft') => {
                    quizStatus.value = status;
                }).then(completedQuiz => {
                    if (completedQuiz && completedQuiz.status === 'completed') {
                        console.log('Quiz generation completed successfully');
                    } else {
                        console.log('Quiz generation did not complete successfully');
                    }
                }).catch(error => {
                    console.error('Error polling quiz status:', error);
                });
            }
        }
    }

    function stopLoading(completedQuizId: string | null = null) {
        const quizId = completedQuizId;
        isLoading.value = false;
        currentQuizId.value = null;
        quizStatus.value = null;
        stopPolling();
        return quizId;
    }

    async function checkQuizStatus() {
        if (!currentQuizId.value) return

        try {
            const quiz = await QuizService.getQuizById(currentQuizId.value)
            if (quiz.status) {
                // Seulement mettre à jour si le statut a changé
                if (quizStatus.value !== quiz.status) {
                    console.log(`Quiz status changed: ${quizStatus.value} -> ${quiz.status}`);
                    quizStatus.value = quiz.status
                }
            }

            if (quiz.status === 'completed' && QuizService.hasQuestions(quiz)) {
                console.log(`Quiz ${quiz.id} completed with ${quiz.questions?.length} questions`);
            }

            if (['completed', 'failed', 'published'].includes(quiz.status || '')) {
                const delay = quiz.status === 'failed' ? 3000 : 1500;

                setTimeout(() => {
                    const completedQuizId = quiz.status === 'completed' || quiz.status === 'published'
                        ? quiz.id
                        : null;

                    stopLoading(completedQuizId)
                }, delay)
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut du quiz:', error)
        }
    }

    function startPolling() {
        if (pollingInterval.value) return

        pollingInterval.value = window.setInterval(checkQuizStatus, 2000)
    }

    function stopPolling() {
        if (pollingInterval.value) {
            clearInterval(pollingInterval.value)
            pollingInterval.value = null
        }
    }

    const generatedQuiz = ref<Quiz | null>(null);

    async function fetchGeneratedQuiz() {
        if (!currentQuizId.value) return null;

        try {
            const quiz = await QuizService.getQuizById(currentQuizId.value);
            generatedQuiz.value = quiz;
            return quiz;
        } catch (error) {
            console.error('Erreur lors de la récupération du quiz généré:', error);
            return null;
        }
    }

    return {
        isLoading,
        currentQuizId,
        quizStatus,
        loadingMessage,
        generatedQuiz,
        startLoading,
        stopLoading,
        checkQuizStatus,
        fetchGeneratedQuiz,
    }
})
