require("dotenv").config();
const {
  connectRabbitMQ,
  getChannel,
  QUEUE_NAME,
} = require("./config/rabbitmq");
const { handleApplicationMessage } = require("./handlers/applicationHandler");

(async () => {
  try {
    await connectRabbitMQ();
    const channel = getChannel();

    channel.prefetch(1);

    console.log(`Waiting for messages in queue: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log("Received message:", content);

          await handleApplicationMessage(content);

          channel.ack(msg);
          console.log("Message acknowledged");
        } catch (err) {
          console.error("Error processing message:", err);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (err) {
    console.error("Failed to start consumer:", err);
    process.exit(1);
  }
})();
