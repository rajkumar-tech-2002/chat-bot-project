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
    const fileName = req.file.originalname.toLowerCase().trim();
    const mimeType = req.file.mimetype;
    
    // Parse PDF, DOCX, or Text
    let textContent = "";
    console.log(`Processing file: ${fileName} (${mimeType})`);

    // Use regex and MimeType for better detection
    if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
      const data = await pdfParse(dataBuffer);
      textContent = data.text;
    } else if (fileName.match(/\.docx$/i) || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      textContent = result.value;
    } else if (fileName.endsWith('.txt') || mimeType === 'text/plain') {
      textContent = dataBuffer.toString('utf-8');
    } else {
      // Emergency binary check: If it starts with PK (ZIP header used by DOCX/XLSX/ZIP)
      if (dataBuffer[0] === 0x50 && dataBuffer[1] === 0x4B) { 
        // If it got here, it's a binary file that we failed to parse as DOCX
        throw new Error("This file appears to be a Word/ZIP document but didn't match the parser. Please ensure it has a proper .docx extension.");
      }
      textContent = dataBuffer.toString('utf-8');
    }

    if (!textContent || textContent.trim().length < 10) {
      throw new Error("Failed to extract meaningful text. The document might be empty, scanned-only, or corrupted.");
    }
    
    // Clear old knowledge before adding new one to prevent "Residual Junk" (Mock Mode optimization)
    aiService.clearStore();
    
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
