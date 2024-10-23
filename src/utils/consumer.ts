import amp from "amqplib";
import { sendEmail } from "./sendEmail.js";

export async function connectAndReceive() {
  let connection, channel: amp.Channel;
  try {
    connection = await amp.connect("amqp://localhost");
    channel = await connection.createChannel();
    if (!channel) {
      throw new Error("No channel exists");
    }
    const exchange = "noti-sys";
    channel.assertExchange(exchange, "direct", {
      durable: false,
    });
    const queue = await channel.assertQueue("email_queue", {
      exclusive: true,
    });
    console.log({ queue });
    const serverities = ["info", "success", "failed"];

    serverities.forEach(function (severity) {
      channel.bindQueue(queue.queue, exchange, severity);
    });

    console.log("📧 Email worker started and waiting for messages");
    channel.consume(
      queue.queue,
      async (data) => {
        if (data.content) {
          const x = JSON.parse(`${Buffer.from(data.content)}`);
          // console.log(x);
          console.log(data.content.toString());
          // console.log(`${Buffer.from(data.content)}`);
          await sendEmail({
            email: x.email,
            subject: x.subject,
          });
        }
      },
      {
        noAck: true,
      }
    );
    // console.log(`Message published to exchange "${exchange}" with severity: ${msg}`);
  } catch (error) {
    console.log(error);
    // throw new Error((error as Error).message);
  }
}

connectAndReceive();
