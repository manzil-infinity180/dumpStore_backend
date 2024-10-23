import amp from "amqplib";
import { IMailOption, sendEmail } from "./sendEmail.js";

export async function connectAndSendMessage(msg: IMailOption) {
  let connection: amp.Connection, channel: amp.Channel;
  try {
    // connect to rabbitmq server
    connection = await amp.connect("amqp://localhost");
    // create a channel
    channel = await connection.createChannel();
    const exchange = "noti-sys";
    // const severity = exchange.length > 0 ? "exchange" : "info";
    channel.assertExchange(exchange, "direct", {
      durable: false,
    });
    console.log({ msg });
    let severity = "info";
    if (msg.email !== null) {
      severity = "success";
    } else {
      severity = "failed";
    }
    const published = channel.publish(
      exchange,
      severity,
      Buffer.from(JSON.stringify(msg))
    );
    console.log(`Message published: ${published}`);

    // Wait for confirmation before closing the channel
    if (!published) {
      console.log("Waiting for confirmation...");
      await new Promise((resolve) => {
        channel.once("drain", resolve);
      });
    }
  } catch (error) {
    console.error("Error publishing message:", error);
    throw error;
  }
}
