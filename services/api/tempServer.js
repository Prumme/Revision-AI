const express = require('express');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const app = express();
const amqp = require('amqplib')
const port = 8080;

const s3 = new AWS.S3({
  accessKeyId: process.env.SCALEWAY_ACCESS_KEY_ID,
  secretAccessKey: process.env.SCALEWAY_ACCESS_KEY,
  endpoint: process.env.SCALEWAY_BUCKET_URL, // ex: 'https://s3.fr-par.scw.cloud'
  region: process.env.SCALEWAY_REGION,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});


const BUCKET_NAME = "uploads";
// Configurer Multer pour enregistrer les fichiers dans "uploads"
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Servir les fichiers statiques (le frontend)
app.use(express.static('public'));

// Route d'upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('Aucun fichier reçu.');
  const params = {
    Bucket: BUCKET_NAME,
    Key: Date.now() + '-' + req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  s3.upload(params, async (err, data) => {
    if (err) {
      console.error('Erreur S3 :', err);
      return res.status(500).send('Erreur lors de l\'upload.');
    }

    //envoie sur la queue rabitMQ
    const queue = 'file-uploaded';
    const msg = {
      bucketName: data.Bucket,
      fileName: data.Key,
      objectKey: data.Key,
      fileId: data.Key,
    };

    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
    setTimeout(() => {
      connection.close();
    }, 500);

    res.send(`Fichier uploadé sur Scaleway S3 : <a href="${data.Location}" target="_blank">${data.Location}</a>`);
  });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
