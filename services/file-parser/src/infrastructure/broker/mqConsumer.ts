import amqp from 'amqplib';
import { fileUploadedEvent } from "./messages/fileUploadedEvent";
import { PDFReader } from "../services/PDFReader";
import { handleFileUploadedUseCaseFactory } from "../../app/usecases/HandleFileUploadedUseCase";
import { HTTPFileDownloader } from "../services/HTTPFileDownloader";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'file-uploaded';

const fileDownloader = new HTTPFileDownloader()
const fileReader = new PDFReader()
const handleFileUploadedUseCase = handleFileUploadedUseCaseFactory(fileDownloader,fileReader)
export const mqConsumer = async () => {
  async function onMessage(msg : any){
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