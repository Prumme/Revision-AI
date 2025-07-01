import amqp from 'amqplib';
import { generateQuizFromFileContentFactory } from "../../app/usecases/GenerateQuizFromFileContentUseCase";
import { PrometheusMetricsExporter } from "../monitoring/PrometheusMetricsExporter";
import { ScalewayQuizIAAgent } from "../services/ScalewayQuizIAAgent";
import { fileParsedEvent } from "./messages/fileParsedEvent";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'file-parsed';


const quizIAAgent = new ScalewayQuizIAAgent()

export const mqConsumer = async () => {
   PrometheusMetricsExporter.exposeMetrics()
   const generateQuizUseCase = generateQuizFromFileContentFactory(quizIAAgent, new PrometheusMetricsExporter())

   async function onMessage(msg: amqp.Message | null) {
      if (!msg) return;
      const content = msg.content.toString();
      const parsedContent = JSON.parse(content);
      const safeContentResult = fileParsedEvent.safeParse(parsedContent);

      if (!safeContentResult.success) {
         console.error("Invalid message format", safeContentResult.error);
         channel.nack(msg, false, false);
         return;
      }
      const fileParsed = safeContentResult.data;

      try {
         // Import the QuizApiService
         const { QuizApiService } = await import("../api/quizApi");

         // Mettre à jour le statut en "processing" avant de générer le quiz
         await QuizApiService.updateQuizWithQuestions({
            quizId: fileParsed.meta.quizId,
            questions: [],
            status: 'processing'
         });

         const fileContentResult = await generateQuizUseCase(fileParsed);

         if (!fileContentResult.success) {
            console.error("Error generating the quiz:", fileContentResult.error.message);

            // Mettre à jour le statut en "failed" si la génération échoue
            await QuizApiService.updateQuizWithQuestions({
               quizId: fileParsed.meta.quizId,
               questions: [],
               status: 'failed'
            });

            channel.nack(msg, false, false);
            return;
         } const quiz = fileContentResult.value;
         console.log("Quiz generated successfully:", JSON.stringify(quiz, null, 2));

         if (!quiz.questions || quiz.questions.length === 0) {
            console.error("No questions were generated for quiz", fileParsed.meta.quizId);

            await QuizApiService.updateQuizWithQuestions({
               quizId: fileParsed.meta.quizId,
               questions: [],
               status: 'failed'
            });

            channel.nack(msg, false, false);
            return;
         }

         const validQuestions = quiz.questions.filter(q => {
            if (!q.q || !q.answers || q.answers.length === 0) {
               console.warn("Skipping invalid question:", q);
               return false;
            }
            return true;
         }).map(q => {
            const validAnswers = q.answers.filter(a => a.a !== undefined && a.c !== undefined);
            return {
               q: q.q,
               answers: validAnswers
            };
         });

         console.log("Valid questions count:", validQuestions.length);

         const updateResult = await QuizApiService.updateQuizWithQuestions({
            quizId: fileParsed.meta.quizId,
            questions: validQuestions,
            status: validQuestions.length > 0 ? 'completed' : 'failed'
         });

         // Publier dans la queue quizz-generated (nom avec deux z)
         if (validQuestions.length > 0) {
            const { mqProvide } = await import('./mqProvider');
            await mqProvide({
               quizId: fileParsed.meta.quizId,
               questions: validQuestions
            }, 'quizz-generated');
            console.log('Quiz publié dans la queue quizz-generated');
         }

         channel.ack(msg);
      } catch (error) {
         console.error("Error in message processing:", error);

         try {
            const { QuizApiService } = await import("../api/quizApi");

            await QuizApiService.updateQuizWithQuestions({
               quizId: fileParsed.meta.quizId,
               questions: [],
               status: 'failed'
            });
         } catch (apiError) {
            console.error("Error updating quiz status:", apiError);
         }

         channel.nack(msg, false, false);
      }
   }

   const connection = await amqp.connect(RABBITMQ_URL);
   const channel = await connection.createChannel();
   await channel.assertQueue(QUEUE_NAME, { durable: true });
   await channel.prefetch(1);
   console.log(`Waiting for messages in ${QUEUE_NAME}...`);
   await channel.consume(QUEUE_NAME, onMessage, { noAck: false })
}