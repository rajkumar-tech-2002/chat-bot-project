const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('./env.config');

module.exports = {
  HOST: DB_HOST,
  USER: DB_USER,
  PASSWORD: DB_PASSWORD,
  DB: DB_NAME,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
