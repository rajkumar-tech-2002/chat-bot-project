const aiService = require('../services/ai.service');
const db = require('../models');

exports.basicChat = async (req, res) => {
  try {
    const { question, category = "General" } = req.body;
    if (!question) {
       return res.status(400).json({ error: "Question is required." });
    }
    const answer = await aiService.basicChat(question);

    // Save conversation 
    db.conversations.create({
      user_id: 1, // Mock user for now
      question,
      answer,
      category
    }).catch(err => console.error("Error saving conversation logs:", err));

    res.json({ answer });
  } catch (error) {
    console.error("Basic chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
};

exports.ragChat = async (req, res) => {
  try {
    const { question, category = "Admission" } = req.body;
    if (!question) {
       return res.status(400).json({ error: "Question is required." });
    }
    const answer = await aiService.ragChat(question);

    db.conversations.create({
      user_id: 1,
      question,
      answer,
      category
    }).catch(err => console.error("Error saving conversation logs:", err));

    res.json({ answer });
  } catch (error) {
    console.error("RAG chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process RAG chat" });
  }
};
