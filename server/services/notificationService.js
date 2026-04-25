const nodemailer = require('nodemailer');
const twilio = require('twilio');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `ConfConnect <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error('Email could not be sent', error);
  }
};

const sendWhatsApp = async (phone, message) => {
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const formattedPhone = phone.replace(/[\s-]/g, '');
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formattedPhone}`,
    });
    console.log(`WhatsApp sent to ${phone}`);
  } catch (error) {
    console.error('WhatsApp message could not be sent', error);
  }
};

module.exports = { sendEmail, sendWhatsApp };
