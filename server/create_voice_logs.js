const pool = require('./config/db.config');

const sql = `
CREATE TABLE IF NOT EXISTS voice_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id INT NULL,
  question_text TEXT,
  answer_text TEXT,
  audio_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

pool.execute(sql)
  .then(() => {
    console.log('SUCCESS: voice_logs table is ready.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
