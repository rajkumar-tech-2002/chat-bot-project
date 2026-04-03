const pool = require('../config/db.config');
const User = require('./user.model');
const Conversation = require('./conversation.model');
const Document = require('./document.model');
const Visitor = require('./visitor.model');
const VoiceLog = require('./voicelog.model');

module.exports = {
  pool,
  User,
  Conversation,
  Document,
  Visitor,
  VoiceLog
};
