import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
export interface IMailOption {
  email: string;
  subject: string;
}
export const sendEmail = async (options: IMailOption) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.REAL_EMAIL_ID_NEW,
      pass: process.env.REAL_PASSWORD_NEW,
    },
  });
  const mailOption = {
    from: "dumpStore.click <noreply.dumpstore.xf@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: "Hello Word",
  };
  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
