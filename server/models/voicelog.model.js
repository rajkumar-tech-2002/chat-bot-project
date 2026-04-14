const pool = require('../config/db.config');

const VoiceLog = {
  findAll: async (filters = {}) => {
    let sql = `
      SELECT vl.*, v.name as visitor_name, v.email as visitor_email 
      FROM voice_logs vl
      LEFT JOIN visitors v ON vl.visitor_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.startDate) {
      sql += " AND vl.created_at >= ?";
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += " AND vl.created_at <= ?";
      params.push(filters.endDate);
    }
    if (filters.month) {
      sql += " AND MONTH(vl.created_at) = ?";
      params.push(filters.month);
    }

    sql += " ORDER BY vl.created_at DESC";

    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  countAll: async () => {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM voice_logs');
    return rows[0].total;
  },

  findByVisitor: async (visitor_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM voice_logs WHERE visitor_id = ? ORDER BY id ASC',
      [visitor_id]
    );
    return rows;
  },

  findBySession: async (session_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM voice_logs WHERE session_id = ? ORDER BY id ASC',
      [session_id]
    );
    return rows;
  }
};

module.exports = VoiceLog;
