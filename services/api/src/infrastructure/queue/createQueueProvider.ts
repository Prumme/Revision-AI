import * as amqp from 'amqplib';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export const createQueueProvider = (queueName: string) => {
  return async (data) => {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(queueName, { durable: true });

      const msg = JSON.stringify(data);
      channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });

      console.log('Message envoyé dans RabbitMQ:', msg);

      setTimeout(() => {
        channel.close();
        connection.close();
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };
};
