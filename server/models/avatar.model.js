const pool = require('../config/db.config');

const Avatar = {
  create: async (name, gender, image_url, greeting_video_url, speaking_video_url, description) => {
    const [result] = await pool.execute(
      'INSERT INTO avatars (name, gender, image_url, greeting_video_url, speaking_video_url, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, gender, image_url, greeting_video_url || null, speaking_video_url || null, description || '']
    );
    return { id: result.insertId, name, gender, image_url, greeting_video_url, speaking_video_url, description };
  },

  findAll: async () => {
    const [rows] = await pool.query(
      'SELECT * FROM avatars ORDER BY created_at DESC'
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM avatars WHERE id = ? LIMIT 1',
      [parseInt(id)]
    );
    return rows[0] || null;
  },

  deleteById: async (id) => {
    await pool.execute('DELETE FROM avatars WHERE id = ?', [parseInt(id)]);
  },

  update: async (id, name, gender, description) => {
    await pool.execute(
      'UPDATE avatars SET name = ?, gender = ?, description = ? WHERE id = ?',
      [name, gender, description || '', parseInt(id)]
    );
    return { id, name, gender, description };
  }
};

module.exports = Avatar;
