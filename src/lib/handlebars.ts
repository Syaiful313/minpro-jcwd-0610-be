import handlebars from "handlebars";
import { transporter } from "./nodemailer";
import { notificationTransactionTemplate } from "../templates/NotificationTransaction";

export const sendTransactionEmail = async (data: {
  email: string;
  name: string;
  transactionStatus: string;
  ticketQuantity: string;
  totalDiscount: string;
  totalPrice: string;
  total: string;
}) => {
  const {
    email,
    name,
    transactionStatus,
    totalDiscount,
    totalPrice,
    ticketQuantity,
    total,
  } = data;

  const template = handlebars.compile(notificationTransactionTemplate);

  const html = template({
    email,
    name,
    transactionStatus,
    ticketQuantity,
    totalDiscount,
    totalPrice,
    total,
  });

  const mailOptions = {
    from: `"EventNesia" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: `Transaction ${transactionStatus}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending transaction email:", error);
  }
};


