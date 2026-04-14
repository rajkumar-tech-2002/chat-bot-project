const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'raju',
    password: 'Rajkumar@2002',
    database: 'chatbot'
  });

  try {
    console.log("Running migration...");
    await connection.query("ALTER TABLE conversations ADD COLUMN session_id VARCHAR(255) AFTER id");
    await connection.query("ALTER TABLE voice_logs ADD COLUMN session_id VARCHAR(255) AFTER id");
    console.log("Migration successful!");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME' || err.message.includes('Duplicate column')) {
      console.log("Columns already exist. Skipping.");
      process.exit(0);
    }
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
