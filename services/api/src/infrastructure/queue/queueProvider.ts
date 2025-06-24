import { QueueProvider } from '@services/QueueProvider';
import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export const RabbitMQQueueProvider: QueueProvider<any> = async (
  queue,
  data,
) => {
  let connection: amqp.Connection | null = null;
  let channel: amqp.Channel | null = null;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    const msg = JSON.stringify(data);
    channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

    console.log('Message envoyé dans RabbitMQ:', msg);
  } catch (error) {
    console.error('Erreur RabbitMQ:', error);
    throw error;
  } finally {
    // Cleanup ressources même en cas d'erreur
    if (channel) {
      try {
        await channel.close();
      } catch { }
    }
    if (connection) {
      try {
        await connection.close();
      } catch { }
    }
  }
};
