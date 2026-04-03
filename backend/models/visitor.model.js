const pool = require('../config/db.config');

const Visitor = {
  create: async (name, mobile, email) => {
    const [result] = await pool.execute(
      'INSERT INTO visitors (name, mobile, email) VALUES (?, ?, ?)',
      [name, mobile, email]
    );
    return { id: result.insertId, name, mobile, email };
  },

  findAll: async () => {
    const [rows] = await pool.execute('SELECT * FROM visitors ORDER BY id DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM visitors WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },
  
  findByMobile: async (mobile) => {
    const [rows] = await pool.execute(
      'SELECT * FROM visitors WHERE mobile = ? LIMIT 1',
      [mobile]
    );
    return rows[0] || null;
  }
};

module.exports = Visitor;
