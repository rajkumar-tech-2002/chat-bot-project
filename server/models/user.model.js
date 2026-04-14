const pool = require('../config/db.config');

const User = {
  findOne: async (user_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ? LIMIT 1',
      [user_id]
    );
    return rows[0] || null;
  },

  create: async (name, user_id, email, password, phone) => {
    const [result] = await pool.execute(
      'INSERT INTO users (name, user_id, email, password, phone) VALUES (?, ?, ?, ?, ?)',
      [name, user_id, email, password, phone]
    );
    return { id: result.insertId, name, user_id, email, phone };
  },

  findAll: async () => {
    const [rows] = await pool.execute('SELECT * FROM users');
    return rows;
  }
};

module.exports = User;
