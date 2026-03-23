const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const aiService = require('../services/ai.service');
const db = require('../models');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF, DOCX, or Text
    let textContent = "";
    if (req.file.originalname.toLowerCase().endsWith('.pdf')) {
      const data = await pdfParse(dataBuffer);
      textContent = data.text;
    } else if (req.file.originalname.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      textContent = result.value;
    } else {
      textContent = dataBuffer.toString('utf-8');
    }
    
    // Initialize Vector Store
    await aiService.addDocumentToStore(textContent);
    
    // Save to DB
    const doc = await db.documents.create({
      title: req.file.originalname,
      file_path: filePath
    });
    
    res.json({ 
      message: "Document processed and added to AI knowledge base successfully.",
      document: doc
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload document" });
  }
};
