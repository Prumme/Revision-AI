import * as amqp from 'amqplib';
import { QuizService } from "@modules/quiz/quiz.service";
import { Logger } from '@nestjs/common';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'quizz-generated';

export async function quizGeneratedConsumer(quizService: QuizService) {
  const logger = new Logger('quizGeneratedConsumer');
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  logger.log(`Listening for messages in ${QUEUE_NAME}`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;
    try {
      const content = msg.content.toString();
      const { quizId, questions } = JSON.parse(content);
      logger.log(`Received quiz-generated for quizId: ${quizId}`);
      await quizService.updateQuizQuestionsFromQueue(quizId, questions);
      channel.ack(msg);
    } catch (err) {
      logger.error('Error processing quiz-generated message', err);
      channel.nack(msg, false, false);
    }
  });
}

