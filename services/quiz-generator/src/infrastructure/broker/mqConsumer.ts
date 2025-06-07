import amqp from 'amqplib';
import { fileParsedEvent } from "./messages/fileParsedEvent";
import { ScalewayQuizIAAgent } from "../services/ScalewayQuizIAAgent";
import { PrometheusMetricsExporter } from "../monitoring/PrometheusMetricsExporter";
import { generateQuizFromFileContentFactory } from "../../app/usecases/GenerateQuizFromFileContentUseCase";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'file-parsed';


const quizIAAgent = new ScalewayQuizIAAgent()

export const mqConsumer = async () => {
   PrometheusMetricsExporter.exposeMetrics()
   const generateQuizUseCase = generateQuizFromFileContentFactory(quizIAAgent, new PrometheusMetricsExporter())

   async function onMessage(msg : amqp.Message|null){
      if(!msg) return;
      const content = msg.content.toString();
      const parsedContent = JSON.parse(content);
      const safeContentResult = fileParsedEvent.safeParse(parsedContent);

      if(!safeContentResult.success) {
         console.error("Invalid message format", safeContentResult.error);
         channel.nack(msg, false, false);
         return;
      }
      const fileParsed = safeContentResult.data;
      const fileContentResult = await generateQuizUseCase(fileParsed)

      if(!fileContentResult.success) {
         console.error("Error generating the quiz:", fileContentResult.error.message);
         channel.nack(msg, false, false);
         return;
      }

      const quiz = fileContentResult.value;
      console.log("Quiz:", JSON.stringify(quiz, null, 2));

      //@TODO save it to a database or do something with it + send it to another queue
      channel.ack(msg);
   }

   const connection = await amqp.connect(RABBITMQ_URL);
   const channel = await connection.createChannel();
   await channel.assertQueue(QUEUE_NAME, { durable: true });
   await channel.prefetch(1);
   console.log(`Waiting for messages in ${QUEUE_NAME}...`);
   await channel.consume(QUEUE_NAME, onMessage, { noAck: false })
}