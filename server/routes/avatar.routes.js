const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const avatarController = require('../controllers/avatar.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Ensure uploads/avatars directory exists
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Multer storage — keep original extension, unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files and video files (MP4, WebM) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Increased to 50MB for videos
});

// Public route — users can fetch avatars without login
router.get('/', avatarController.getAvatars);

// Protected routes — admin only
router.post('/', verifyToken, upload.fields([
  { name: 'avatar_image', maxCount: 1 },
  { name: 'greeting_video', maxCount: 1 },
  { name: 'speaking_video', maxCount: 1 }
]), avatarController.createAvatar);
router.put('/:id', verifyToken, avatarController.updateAvatar);
router.delete('/:id', verifyToken, avatarController.deleteAvatar);

module.exports = router;
