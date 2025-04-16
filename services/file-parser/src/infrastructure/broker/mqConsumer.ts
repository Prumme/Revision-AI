import amqp from 'amqplib';
import { fileUploadedEvent } from "./messages/fileUploadedEvent";
import { handleFileUploadedUseCaseFactory } from "../../app/usecases/HandleFileUploadedUseCase";
import { HTTPFileDownloader } from "../services/HTTPFileDownloader";
import { FileReaderResolver } from "../services/FileReaderResolver";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'file-uploaded';

const fileDownloader = new HTTPFileDownloader()
const fileReaderResolver = new FileReaderResolver()
const handleFileUploadedUseCase = handleFileUploadedUseCaseFactory(fileDownloader,fileReaderResolver)
export const mqConsumer = async () => {
  async function onMessage(msg : amqp.Message|null){
    if(!msg) return;
    const content = msg.content.toString();
    const parsedContent = JSON.parse(content);
    const safeContentResult = fileUploadedEvent.safeParse(parsedContent);

    if(!safeContentResult.success) {
      console.error("Invalid message format", safeContentResult.error);
      channel.nack(msg);
      return;
    }
    const fileUploaded = safeContentResult.data;
    console.log("Received message:", fileUploaded);
    // Process the message here

    const fileContentResult = await handleFileUploadedUseCase({
      url: fileUploaded.fileUrl,
      fileId: fileUploaded.fileId,
    })

    if(!fileContentResult.success) {
      console.error("Error processing file:", fileContentResult.error.message);
      channel.nack(msg);
      return;
    }

    const fileContent = fileContentResult.value;
    console.log("File content:", fileContent);

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