require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'chatbot',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  EMAIL_USER: process.env.EMAIL_USER || 'rajkumaranbazhagan98@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'mfcv xdex mubm kjru',
};
