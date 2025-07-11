import { suffleQuizChoice, Quiz } from './Quiz';

describe('suffleQuizChoice', () => {
    it('should shuffle the answers of each question in the quiz (statistically)', () => {
        // Génère un quiz avec 100 questions, chacune ayant 3 réponses
        const quiz: Quiz = {
            t: 'Sample Quiz',
            questions: Array.from({ length: 100 }, (_, i) => ({
                q: `Question ${i + 1}`,
                answers: [
                    { a: `Answer ${i + 1}-1`, c: i % 3 === 0 },
                    { a: `Answer ${i + 1}-2`, c: i % 3 === 1 },
                    { a: `Answer ${i + 1}-3`, c: i % 3 === 2 },
                ],
            })),
        };

        // Effectuer plusieurs essais pour réduire l'aléa
        let atLeastOneShuffled = false;
        for (let attempt = 0; attempt < 10; attempt++) {
            const suffledQuiz = suffleQuizChoice(quiz);

            expect(suffledQuiz.t).toBe(quiz.t);
            expect(suffledQuiz.questions).toHaveLength(quiz.questions.length);

            let thisAttemptShuffled = false;

            suffledQuiz.questions.forEach((question, index) => {
                expect(question.q).toBe(quiz.questions[index].q);
                expect(question.answers).toHaveLength(quiz.questions[index].answers.length);

                const originalAnswers = quiz.questions[index].answers.map((a) => a.a);
                const shuffledAnswers = question.answers.map((a) => a.a);

                // Vérifie que les réponses sont les mêmes, mais potentiellement dans un ordre différent
                expect(new Set(shuffledAnswers)).toEqual(new Set(originalAnswers));

                // Vérifie si au moins une question a été mélangée
                if (!thisAttemptShuffled && shuffledAnswers.join() !== originalAnswers.join()) {
                    thisAttemptShuffled = true;
                }
            });

            if (thisAttemptShuffled) {
                atLeastOneShuffled = true;
                break;
            }
        }

        expect(atLeastOneShuffled).toBe(true);
    });
});
