import amqp from "amqplib";
import dotenv from "dotenv";
import { sendOtpMail } from "../services/mailService.js";


dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Hostname,
      port: 5672,
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

    const channel = await connection.createChannel();
    const queueName = "send-otp";
    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ Mail Service consumer started, listening for otp emails");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());
          await sendOtpMail(to, subject, body);
          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (err) {
          console.log("Failed to send otp ", err);
        }
      }
    });
  } catch (err) {
    console.log("Failed to start rabbitmq consumer", err);
  }
}; 