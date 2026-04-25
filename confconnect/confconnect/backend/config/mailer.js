const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER) {
    console.log(`[Email skipped – no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"ConfConnect GOI" <${process.env.SMTP_USER}>`,
    to, subject, html,
  });
};

module.exports = { sendEmail };
