import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = process.env.OUTPUT_QUEUE_NAME || "file-parsed";

export async function mqProvide(
  message: object,
  queueName: string = QUEUE_NAME,
) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    channel.assertQueue(queueName, { durable: true });

    const msg = JSON.stringify(message);
    channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });

    console.log("[FILE-PARSER] Message sent back successfully");

    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    console.error(
      "[FILE-PARSER][ERROR] Erreur lors de l'envoi du message :",
      error,
    );
  }
}
