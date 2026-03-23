const aiService = require('../services/ai.service');
const { Conversation } = require('../models');

exports.basicChat = async (req, res) => {
  try {
    const { question, visitor_id, category = "General" } = req.body;
    if (!question) {
       return res.status(400).json({ error: "Question is required." });
    }
    const answer = await aiService.basicChat(question);

    // Save conversation
    Conversation.create(1, visitor_id || null, question, answer, category)
      .catch(err => console.error("Error saving conversation logs:", err));

    res.json({ answer });
  } catch (error) {
    console.error("Basic chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
};

exports.ragChat = async (req, res) => {
  try {
    const { question, visitor_id, category = "Admission" } = req.body;
    if (!question) {
       return res.status(400).json({ error: "Question is required." });
    }
    const answer = await aiService.ragChat(question);

    Conversation.create(1, visitor_id || null, question, answer, category)
      .catch(err => console.error("Error saving conversation logs:", err));

    res.json({ answer });
  } catch (error) {
    console.error("RAG chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process RAG chat" });
  }
};
