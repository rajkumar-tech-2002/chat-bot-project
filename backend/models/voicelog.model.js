const pool = require('../config/db.config');

const VoiceLog = {
  findByVisitor: async (visitor_id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM voice_logs WHERE visitor_id = ? ORDER BY id ASC',
      [visitor_id]
    );
    return rows;
  }
};

module.exports = VoiceLog;
