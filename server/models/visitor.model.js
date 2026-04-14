const pool = require('../config/db.config');

const Visitor = {
  create: async (name, mobile, email) => {
    const [result] = await pool.execute(
      'INSERT INTO visitors (name, mobile, email) VALUES (?, ?, ?)',
      [name, mobile, email]
    );
    return { id: result.insertId, name, mobile, email };
  },

  findAll: async (limit = 100) => {
    // Using .query for LIMIT as it behaves more robustly with numeric parameters
    const [rows] = await pool.query('SELECT * FROM visitors ORDER BY createdAt DESC LIMIT ' + parseInt(limit));
    return rows;
  },

  countAll: async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM visitors');
    return rows[0].total;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM visitors WHERE id = ? LIMIT 1',
      [parseInt(id)]
    );
    return rows[0] || null;
  },
  
  findByMobile: async (mobile) => {
    const [rows] = await pool.execute(
      'SELECT * FROM visitors WHERE mobile = ? LIMIT 1',
      [mobile]
    );
    return rows[0] || null;
  },

  updateEmail: async (id, email) => {
    await pool.execute(
      'UPDATE visitors SET email = ? WHERE id = ?',
      [email, id]
    );
    return { id, email };
  }
};

module.exports = Visitor;
