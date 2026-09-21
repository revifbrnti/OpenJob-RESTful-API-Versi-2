const amqp = require("amqplib");

const QUEUE_NAME = "application:created";

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      hostname: process.env.RABBITMQ_HOST || "localhost",
      port: parseInt(process.env.RABBITMQ_PORT) || 5672,
      username: process.env.RABBITMQ_USER || "guest",
      password: process.env.RABBITMQ_PASSWORD || "guest",
    });

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log("RabbitMQ connected (Producer)");
    return channel;
  } catch (err) {
    console.error("RabbitMQ connection failed:", err);
    throw err;
  }
};

const publishMessage = async (message) => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log("Message published:", message);
  } catch (err) {
    console.error("Failed to publish message:", err);
    throw err;
  }
};

module.exports = { connectRabbitMQ, publishMessage, QUEUE_NAME };
