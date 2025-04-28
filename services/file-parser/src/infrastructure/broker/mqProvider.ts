import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'file-uploaded';

const messageData = {
  fileId: '1234',
  fileUrl: './test.pdf',
  fileName: 'file1234.pdf',
  fileSize: 1024,
  fileType: 'pdf',
  userId: 'user123',
  uploadDate: new Date(),
};

async function sendMessage() {
  try {
    // Créer une connexion à RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Définir une queue
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Envoyer un message
    const message = JSON.stringify(messageData);
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });

    console.log('Message envoyé dans RabbitMQ:', message);

    // Fermer la connexion
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
  }
}

// Appeler la fonction pour envoyer le message
sendMessage();