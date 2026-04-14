const pool = require('../config/db.config');

const Conversation = {
  create: async (user_id, visitor_id, question, answer, category, session_id) => {
    const [result] = await pool.execute(
      'INSERT INTO conversations (user_id, visitor_id, session_id, question, answer, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [user_id, visitor_id || null, session_id || null, question, answer, category]
    );
    return { id: result.insertId, user_id, visitor_id, session_id, question, answer, category };
  },

  findAll: async (filters = {}) => {
    let sql = `
      SELECT c.*, v.name as visitor_name, v.email as visitor_email 
      FROM conversations c 
      LEFT JOIN visitors v ON c.visitor_id = v.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.startDate) {
      sql += " AND c.createdAt >= ?";
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += " AND c.createdAt <= ?";
      params.push(filters.endDate);
    }
    if (filters.month) {
      sql += " AND MONTH(c.createdAt) = ?";
      params.push(filters.month);
    }
    if (filters.year) {
      sql += " AND YEAR(c.createdAt) = ?";
      params.push(filters.year);
    }

    sql += " ORDER BY c.createdAt DESC";

    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  countAll: async () => {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM conversations');
    return rows[0].total;
  },

  findByUser: async (user_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY createdAt DESC',
      [user_id]
    );
    return rows;
  },

  findByVisitor: async (visitor_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE visitor_id = ? ORDER BY id ASC',
      [visitor_id]
    );
    return rows;
  },

  findBySession: async (session_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM conversations WHERE session_id = ? ORDER BY id ASC',
      [session_id]
    );
    return rows;
  }
};

module.exports = Conversation;
