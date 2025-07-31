import { transporter } from "../config/mailConfig.js";
import { otpTemplate } from "../templates/otpTemplate.js";


export async function sendOtpMail(to: string, subject: string, otp: string) {
  if (to.trim().toLowerCase() === (process.env.USER || '').trim().toLowerCase()) {
    throw new Error("Sender and receiver email addresses cannot be the same.");
  }
  await transporter.sendMail({
    from: "ChatApp",
    to,
    subject,
    text: otp, 
    html: otpTemplate(otp),
  });
} 