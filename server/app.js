const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Frontend URL
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded avatar images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import and use routes
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/visitors', require('./routes/visitor.routes'));
app.use('/api/audio', require('./routes/audio.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/avatars', require('./routes/avatar.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI College Assistant API.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
