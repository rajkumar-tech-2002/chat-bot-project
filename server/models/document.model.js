const pool = require('../config/db.config');

const Document = {
  create: async (title, file_path) => {
    const [result] = await pool.execute(
      'INSERT INTO documents (title, file_path) VALUES (?, ?)',
      [title, file_path]
    );
    return { id: result.insertId, title, file_path };
  },

  findAll: async () => {
    const [rows] = await pool.execute('SELECT * FROM documents ORDER BY id DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM documents WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  deleteById: async (id) => {
    const [result] = await pool.execute(
      'DELETE FROM documents WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  deleteAll: async () => {
    const [result] = await pool.execute('DELETE FROM documents');
    return result.affectedRows;
  }
};

module.exports = Document;
