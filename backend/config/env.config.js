require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'chatbot',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
};
