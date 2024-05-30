import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();
const EMAIL = process.env.EMAIL!;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendMail = async (userMail: string, body: string) => {
    const mailOptions = {
        from: `Talker_Backend <${EMAIL}>`,
        replyTo: "noreply@nextgendev.com",
        to: userMail,
        subject: "Verify your email",
        html: body,
    };
    try {
        await sgMail.send(mailOptions);
    } catch (error) {
        console.log(error);
        throw new Error("Failed to send mail");
    }
};
