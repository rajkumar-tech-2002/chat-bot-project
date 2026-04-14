const fs = require('fs');
const path = require('path');
const { Avatar } = require('../models');

exports.createAvatar = async (req, res) => {
  try {
    if (!req.files || !req.files['avatar_image']) {
      return res.status(400).json({ error: 'Avatar image is required.' });
    }

    const { name, gender, description } = req.body;

    if (!name || !gender) {
      return res.status(400).json({ error: 'Name and gender are required.' });
    }

    if (!['male', 'female'].includes(gender.toLowerCase())) {
      return res.status(400).json({ error: 'Gender must be "male" or "female".' });
    }

    // Build the public URL for the image
    const image_url = `/uploads/avatars/${req.files['avatar_image'][0].filename}`;

    // Optional videos
    let greeting_video_url = null;
    let speaking_video_url = null;

    if (req.files['greeting_video']) {
      greeting_video_url = `/uploads/avatars/${req.files['greeting_video'][0].filename}`;
    }
    if (req.files['speaking_video']) {
      speaking_video_url = `/uploads/avatars/${req.files['speaking_video'][0].filename}`;
    }

    const avatar = await Avatar.create(
      name.trim(),
      gender.toLowerCase(),
      image_url,
      greeting_video_url,
      speaking_video_url,
      description || ''
    );

    res.status(201).json({ message: 'Avatar created successfully.', avatar });
  } catch (error) {
    console.error('Create avatar error:', error);
    res.status(500).json({ error: error.message || 'Failed to create avatar.' });
  }
};

exports.getAvatars = async (req, res) => {
  try {
    const avatars = await Avatar.findAll();
    res.json({ avatars });
  } catch (error) {
    console.error('Get avatars error:', error);
    res.status(500).json({ error: 'Failed to retrieve avatars.' });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    const avatar = await Avatar.findById(id);

    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found.' });
    }

    // Delete the physical image file from disk
    const imagePath = path.join(__dirname, '..', avatar.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete videos if they exist
    if (avatar.greeting_video_url) {
      const gPath = path.join(__dirname, '..', avatar.greeting_video_url);
      if (fs.existsSync(gPath)) fs.unlinkSync(gPath);
    }
    if (avatar.speaking_video_url) {
      const sPath = path.join(__dirname, '..', avatar.speaking_video_url);
      if (fs.existsSync(sPath)) fs.unlinkSync(sPath);
    }

    await Avatar.deleteById(id);

    res.json({ message: 'Avatar deleted successfully.' });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ error: 'Failed to delete avatar.' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, description } = req.body;

    const avatar = await Avatar.findById(id);
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found.' });
    }

    const updated = await Avatar.update(id, name || avatar.name, gender || avatar.gender, description);
    res.json({ message: 'Avatar updated successfully.', avatar: updated });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update avatar.' });
  }
};
