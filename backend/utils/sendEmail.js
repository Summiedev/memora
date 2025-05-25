const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.APP_PASS,
            },
          });
        const mailOptions = {
            to: to,
            from: process.env.EMAIL_USER,
            subject: subject,
            text: html,
          };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Email not sent');
    }
};

module.exports = sendEmail;
