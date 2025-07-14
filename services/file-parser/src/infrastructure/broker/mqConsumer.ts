import amqp from "amqplib";
import fs from "node:fs";
import { handleFileUploadedUseCaseFactory } from "../../app/usecases/HandleFileUploadedUseCase";
import { FileReaderResolver } from "../services/FileReaderResolver";
import {
  S3FileDownloader,
  S3FileDownloaderArgs,
} from "../services/S3FileDownloader";
import { fileUploadedEvent } from "./messages/fileUploadedEvent";
import { mqProvide } from "./mqProvider";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = process.env.INPUT_QUEUE_NAME || "file-uploaded";

const fileDownloader = new S3FileDownloader();
const fileReaderResolver = new FileReaderResolver();
const handleFileUploadedUseCase = handleFileUploadedUseCaseFactory(
  fileDownloader,
  fileReaderResolver,
);
export const mqConsumer = async () => {
  async function onMessage(msg: amqp.Message | null) {
    if (!msg) return;
    const content = msg.content.toString();
    const parsedContent = JSON.parse(content);
    const safeContentResult = fileUploadedEvent.safeParse(parsedContent);

    if (!safeContentResult.success) {
      console.error(
        "[FILE-PARSER][ERROR] Invalid message format",
        safeContentResult.error,
      );
      channel.nack(msg, false, false);
      return;
    }

    const fileUploaded = safeContentResult.data;
    console.log(
      "[FILE-PARSER] New file to parse received",
      fileUploaded.fileName,
    );
    const payload: S3FileDownloaderArgs = {
      fileId: fileUploaded.objectKey, // Placeholder for actual ID
      objectKey: fileUploaded.objectKey,
      bucketName: fileUploaded.bucketName,
      downloadPath: "/var/tmp/" + fileUploaded.objectKey.split("/").pop(),
    };
    const fileContentResult = await handleFileUploadedUseCase(payload);

    if (!fileContentResult.success) {
      console.error(
        "[FILE-PARSER][ERROR] Error processing file:",
        fileContentResult.error.message,
      );
      channel.nack(msg, false, false);
      return;
    }

    const fileContent = fileContentResult.value;

    console.log("[FILE-PARSER] File uploaded event processed successfully");
    await mqProvide({ ...fileUploaded, ...fileContent }).catch(console.error);
    try {
      fs.unlinkSync(payload.downloadPath);
      console.log(
        `[FILE-SERVICE] File ${payload.downloadPath} deleted successfully`,
      );
      channel.ack(msg);
    } catch (error) {
      console.error("[FILE-PARSER][ERROR] Error deleting file:", error);
      channel.nack(msg, false, false);
    }
  }

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.prefetch(1);
  console.log(`[FILE-PARSER] Waiting for messages in ${QUEUE_NAME}...`);
  await channel.consume(QUEUE_NAME, onMessage, { noAck: false });
};
