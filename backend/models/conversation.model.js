const pool = require('../config/db.config');

const Conversation = {
  create: async (user_id, visitor_id, question, answer, category) => {
    const [result] = await pool.execute(
      'INSERT INTO conversations (user_id, visitor_id, question, answer, category) VALUES (?, ?, ?, ?, ?)',
      [user_id, visitor_id || null, question, answer, category]
    );
    return { id: result.insertId, user_id, visitor_id, question, answer, category };
  },

  findAll: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations ORDER BY createdAt DESC'
    );
    return rows;
  },

  findByUser: async (user_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY createdAt DESC',
      [user_id]
    );
    return rows;
  }
};

module.exports = Conversation;
