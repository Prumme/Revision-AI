import amqp from "amqplib";
import { generateQuizFromFileContentFactory } from "../../app/usecases/GenerateQuizFromFileContentUseCase";
import { PrometheusMetricsExporter } from "../monitoring/PrometheusMetricsExporter";
import { quizGenerationMessage } from "./messages/quizGenerationMessage";
import { mqProvide } from "./mqProvider";
import { LangChainQuizIAAgent } from "../services/LangChainQuizIAAgent";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = process.env.QUEUE_NAME || "generate-quiz";

const quizIAAgent = new LangChainQuizIAAgent();

export const mqConsumer = async () => {
  console.log("Starting MQ Consumer for quiz generation...");
  PrometheusMetricsExporter.exposeMetrics();
  const generateQuizUseCase = generateQuizFromFileContentFactory(
    quizIAAgent,
    new PrometheusMetricsExporter(),
  );

  async function onMessage(msg: amqp.Message | null) {
    if (!msg) return;
    const content = msg.content.toString();
    const parsedContent = JSON.parse(content);
    const safeContentResult = quizGenerationMessage.safeParse(parsedContent);

    if (!safeContentResult.success) {
      console.error(
        "Invalid message format",
        JSON.stringify(safeContentResult.error, null, 2),
      );
      channel.nack(msg, false, false);
      return;
    }
    const quizGenerationMessagePayload = safeContentResult.data;

    console.log("Message received:", quizGenerationMessagePayload);

    const fileContentResult = await generateQuizUseCase({
      filesContents: quizGenerationMessagePayload.filesContents,
      questionsNumbers: quizGenerationMessagePayload.questionsNumbers || 5,
    });

    if (!fileContentResult.success) {
      console.error(
        "Error generating the quiz:",
        fileContentResult.error.message,
      );
      await mqProvide({
        success: false,
        identifier: quizGenerationMessagePayload.identifier,
        error: fileContentResult.error.message,
      });

      channel.nack(msg, false, false);
      return;
    }

    const quiz = fileContentResult.value;
    console.log("Quiz generated successfully:", JSON.stringify(quiz, null, 2));
    await mqProvide({
      success: true,
      identifier: quizGenerationMessagePayload.identifier,
      ...quiz,
    });
    channel.ack(msg);
  }

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.prefetch(1);
  console.log(`Waiting for messages in ${QUEUE_NAME}...`);
  await channel.consume(QUEUE_NAME, onMessage, { noAck: false });
};
