const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config/env.config');

/**
 * Send email with attachments
 * @param {string} toEmail 
 * @param {string} userName 
 * @param {Array} attachments [{ filename, content, path }]
 */
exports.sendSessionEmail = async (toEmail, userName, attachments) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER || 'rajkumaranbazhagan98@gmail.com',
      pass: EMAIL_PASS, // App Password must be provided in .env
    },
  });

  const mailOptions = {
    from: EMAIL_USER || 'rajkumaranbazhagan98@gmail.com',
    to: toEmail,
    subject: 'Your Conversation Report - Zhara AI',
    text: `Hi ${userName || 'there'},

Thank you for using Zhara AI.

Please find attached your session details:
- PDF Transcript
- Word Document
- Audio Files (if available)

Best regards,
Zhara AI Team`,
    attachments: attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
