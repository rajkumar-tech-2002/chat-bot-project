const app = require('./app');
const db = require('./models');
const { PORT } = require('./config/env.config');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const aiService = require('./services/ai.service');

async function loadExistingDocuments() {
  try {
    const docs = await db.documents.findAll();
    if (docs.length === 0) return;
    console.log(`Auto-loading ${docs.length} previously uploaded documents into Vector Store...`);
    
    for (const doc of docs) {
      if (!fs.existsSync(doc.file_path)) continue;
      
      const dataBuffer = fs.readFileSync(doc.file_path);
      const fileName = doc.file_path.toLowerCase();
      let textContent = "";
      
      if (fileName.endsWith('.pdf')) {
        const data = await pdfParse(dataBuffer);
        textContent = data.text;
      } else if (fileName.endsWith('.docx')) {
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

db.sequelize.sync({ alter: true })
  .then(async () => {
    console.log("Synced db.");
    await loadExistingDocuments();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });
