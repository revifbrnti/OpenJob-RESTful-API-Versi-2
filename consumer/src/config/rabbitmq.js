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

    console.log("RabbitMQ connected (Consumer)");
    return channel;
  } catch (err) {
    console.error("RabbitMQ connection failed:", err);
    throw err;
  }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel, QUEUE_NAME };
