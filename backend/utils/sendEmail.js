import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, htmlText) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // e.g., 'Gmail'
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlText,
        });

        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email not sent:', error);
    }
};

export default sendEmail;
