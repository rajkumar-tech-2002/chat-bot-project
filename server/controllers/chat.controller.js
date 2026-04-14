const aiService = require('../services/ai.service');
const { Conversation, Visitor, VoiceLog } = require('../models');
const transcriptService = require('../services/transcript.service');
const emailService = require('../services/email.service');
const fs = require('fs');
const path = require('path');

exports.basicChat = async (req, res) => {
  try {
    const { question, visitor_id, session_id, category = "General" } = req.body;
    if (!question) {
       return res.status(400).json({ error: "Question is required." });
    }
    const answer = await aiService.basicChat(question);

    // Save conversation
    Conversation.create(1, visitor_id || null, question, answer, category, session_id || null)
      .catch(err => console.error("Error saving conversation logs:", err));

    res.json({ answer });
  } catch (error) {
    console.error("Basic chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
};

exports.ragChat = async (req, res) => {
  try {
    const { question, visitor_id, session_id, category = "Admission" } = req.body;
    if (!question) {
       return res.status(400).json({ error: "Question is required." });
    }
    const answer = await aiService.ragChat(question);

    Conversation.create(1, visitor_id || null, question, answer, category, session_id || null)
      .catch(err => console.error("Error saving conversation logs:", err));

    res.json({ answer });
  } catch (error) {
    console.error("RAG chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process RAG chat" });
  }
};

exports.endSession = async (req, res) => {
    const { visitor_id, session_id } = req.body;
  if (!visitor_id) {
    return res.status(400).json({ error: "Visitor ID is required." });
  }

  try {
    const visitor = await Visitor.findById(visitor_id);
    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found." });
    }

    if (!visitor.email) {
      return res.status(400).json({ error: "Visitor doesn't have an email associated." });
    }

    console.log(`Ending session for visitor: ${visitor.name} (${visitor.email}) [Session: ${session_id || 'N/A'}]`);

    // Use session_id if provided, otherwise fallback to visitor_id (all history)
    const history = session_id 
      ? await Conversation.findBySession(session_id)
      : await Conversation.findByVisitor(visitor_id);
    
    const audioLogs = session_id
      ? await VoiceLog.findBySession(session_id)
      : await VoiceLog.findByVisitor(visitor_id);

    if (history.length === 0) {
      return res.status(400).json({ error: "No conversation history found for this session." });
    }

    // Format chatLog for transcript generation
    const chatLog = [];
    history.forEach(h => {
      chatLog.push({ role: 'user', content: h.question, timestamp: h.createdAt });
      chatLog.push({ role: 'assistant', content: h.answer, timestamp: h.createdAt });
    });

    console.log("Generating transcripts...");
    const wordBuffer = await transcriptService.generateWord(visitor, chatLog);

    let attachments = [
      { filename: 'Conversation_Transcript.docx', content: wordBuffer }
    ];

    // Add audio attachments
    audioLogs.forEach((log, index) => {
      if (log.audio_path && fs.existsSync(log.audio_path)) {
        attachments.push({
          filename: `Audio_Recording_${index + 1}.webm`,
          path: log.audio_path
        });
      }
    });

    console.log(`Sending email to ${visitor.email} with ${attachments.length} attachments...`);
    await emailService.sendSessionEmail(visitor.email, visitor.name, attachments);

    res.json({ success: true, message: "Report sent to email successfully" });

  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ error: "Failed to send final report. " + error.message });
  }
};
