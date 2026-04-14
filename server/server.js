const app = require('./app');
const pool = require('./config/db.config');
const { Document } = require('./models');
const { PORT } = require('./config/env.config');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const aiService = require('./services/ai.service');

async function loadExistingDocuments() {
  try {
    const docs = await Document.findAll();
    if (docs.length === 0) return;
    
    // Check if store was already populated from knowledge_base.json
    if (aiService.getStoreSize() > 0) {
        console.log("Knowledge Base already loaded from persistent storage. Skipping DB auto-load.");
        return;
    }

    console.log(`Auto-loading ${docs.length} previously uploaded documents into Vector Store...`);
    
    for (const doc of docs) {
      if (!fs.existsSync(doc.file_path)) continue;
      
      const dataBuffer = fs.readFileSync(doc.file_path);
      const fileName = doc.title.toLowerCase();
      let textContent = "";
      
      if (fileName.endsWith('.pdf')) {
        const data = await pdfParse(dataBuffer);
        textContent = data.text;
      } else if (fileName.match(/\.docx$/i)) {
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        textContent = result.value;
      } else {
        textContent = dataBuffer.toString('utf-8');
      }
      
      await aiService.addDocumentToStore(textContent);
    }
    console.log("Knowledge Base fully restored from Database!");
  } catch (error) {
    console.error("Failed to auto-load documents on startup:", error);
  }
}

// Test DB connection then start server
pool.getConnection()
  .then(async (conn) => {
    conn.release();
    console.log("Database connected.");
    await loadExistingDocuments();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to DB: " + err.message);
  });
