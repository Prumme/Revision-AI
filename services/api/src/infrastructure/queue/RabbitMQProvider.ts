import * as amqp from 'amqplib';
import { QueueProvider } from '@services/QueueProvider';
import { Logger } from '@nestjs/common';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export class RabbitMQProvider<Payload> implements QueueProvider<Payload> {
  private readonly logger: Logger;
  constructor(private readonly queueName: string) {
    this.logger = new Logger('RabbitMQProvider-' + queueName);
  }
  async send(payload: Payload): Promise<void> {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(this.queueName, { durable: true });

      const msg = JSON.stringify(payload);
      channel.sendToQueue(this.queueName, Buffer.from(msg), {
        persistent: true,
      });

      this.logger.log('Message envoyé RabbitMQ on -> ' + this.queueName);

      setTimeout(() => {
        channel.close();
        connection.close();
      }, 500);
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi du message :", error);
    }
  }
}
