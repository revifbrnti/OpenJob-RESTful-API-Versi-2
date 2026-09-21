require("dotenv").config();
const app = require("./app");
const { connectRabbitMQ } = require("./services/rabbitmqService");

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

(async () => {
  try {
    await connectRabbitMQ();

    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
