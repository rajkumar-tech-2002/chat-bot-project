const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db.config');

// Ensure uploads/audio directory exists
const audioDir = path.join(__dirname, '../uploads/audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// Multer storage for audio files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `audio_${Date.now()}.webm`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// POST /api/audio/save
const saveAudio = async (req, res) => {
    try {
        const { question_text, answer_text, visitor_id } = req.body;
        const audio_path = req.file ? req.file.path : null;

        await pool.execute(
            `INSERT INTO voice_logs (visitor_id, question_text, answer_text, audio_path)
             VALUES (?, ?, ?, ?)`,
            [visitor_id || null, question_text || '', answer_text || '', audio_path || '']
        );

        res.json({ success: true, audio_path });
    } catch (error) {
        console.error('Error saving audio log:', error);
        res.status(500).json({ success: false, message: 'Failed to save audio log.' });
    }
};

module.exports = { upload, saveAudio };
