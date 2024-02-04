import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const EMAIL = process.env.EMAIL!;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD!;

export const sendMail = (userMail: string, body: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL,
            pass: EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: "Twitter_Backend <noreply@nextgendev.com>",
        replyTo: "noreply@nextgendev.com",
        to: userMail,
        subject: "Your one time password",
        html: body,
    };

    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
            console.log(err);
            throw new Error("Something went wrong");
        } else {
            console.log(res.response);
        }
    });
};
