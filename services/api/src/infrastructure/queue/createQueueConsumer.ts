import { z, ZodType } from 'zod';
import * as amqp from 'amqplib';
import { Logger } from '@nestjs/common';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
export async function createQueueConsumer<T extends ZodType>(
  queueName: string,
  zodSchema: T,
  handler: (data: z.infer<T>) => void | Promise<void>,
) {
  const logger = new Logger(`queue-consumer-${queueName}`);
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (msg) => {
    if (!msg) return;
    try {
      const content = msg.content.toString();
      const notSafeContent = JSON.parse(content);
      const parsedData = zodSchema.parse(notSafeContent);
      logger.log(`Received message: ${content}`);
      await handler(parsedData);
      channel.ack(msg);
    } catch (err) {
      logger.error('Error processing message', err);
      channel.nack(msg, false, false);
    }
  });
}
