const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const aiService = require('../services/ai.service');
const { Document } = require('../models');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const fileName = req.file.originalname.toLowerCase().trim();
    const mimeType = req.file.mimetype;
    
    // Parse PDF, DOCX, or Text
    let textContent = "";
    console.log(`Processing file: ${fileName} (${mimeType})`);

    if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
      const data = await pdfParse(dataBuffer);
      textContent = data.text;
    } else if (fileName.match(/\.docx$/i) || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      textContent = result.value;
    } else if (fileName.endsWith('.txt') || mimeType === 'text/plain') {
      textContent = dataBuffer.toString('utf-8');
    } else {
      if (dataBuffer[0] === 0x50 && dataBuffer[1] === 0x4B) {
        throw new Error("This file appears to be a Word/ZIP document but didn't match the parser. Please ensure it has a proper .docx extension.");
      }
      textContent = dataBuffer.toString('utf-8');
    }

    if (!textContent || textContent.trim().length < 10) {
      throw new Error("Failed to extract meaningful text. The document might be empty, scanned-only, or corrupted.");
    }
    
    // Clear old knowledge before adding new one
    aiService.clearStore();
    
    // Initialize Vector Store
    await aiService.addDocumentToStore(textContent);
    
    // Save to DB
    const doc = await Document.create(req.file.originalname, filePath);
    
    res.json({ 
      message: "Document processed and added to AI knowledge base successfully.",
      document: doc
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload document" });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.findAll();
    res.json({ documents: docs });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
};

exports.clearKnowledgeBase = async (req, res) => {
  try {
    const docs = await Document.findAll();
    
    // Delete physical files
    docs.forEach(doc => {
      if (doc.file_path && fs.existsSync(doc.file_path)) {
        try { fs.unlinkSync(doc.file_path); } catch(e) { console.error("File delete fail:", doc.file_path); }
      }
    });

    // Clear DB
    await Document.deleteAll();

    // Clear AI Memory
    aiService.clearStore();

    res.json({ message: "AI Knowledge Base and all source documents cleared successfully." });
  } catch (error) {
    console.error("Clear KB error:", error);
    res.status(500).json({ error: "Failed to clear knowledge base" });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Delete physical file
    if (doc.file_path && fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    // Delete DB record
    await Document.deleteById(id);
    
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};
