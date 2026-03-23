const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const fs = require('fs');
const path = require('path');

const KB_FILE = path.join(__dirname, '../knowledge_base.json');
let documents = []; // Store docs with embeddings locally
let embeddingsModel = null;
let chatModel = null;

/**
 * Load documents from disk if they exist.
 */
const loadStoreFromDisk = () => {
  try {
    if (fs.existsSync(KB_FILE)) {
      const data = fs.readFileSync(KB_FILE, 'utf-8');
      documents = JSON.parse(data);
      console.log(`Loaded ${documents.length} chunks from disk.`);
    }
  } catch (err) {
    console.warn("Failed to load knowledge base from disk:", err.message);
  }
};

/**
 * Save documents to disk.
 */
const saveStoreToDisk = () => {
  try {
    fs.writeFileSync(KB_FILE, JSON.stringify(documents, null, 2));
    console.log(`Saved ${documents.length} chunks to disk.`);
  } catch (err) {
    console.error("Failed to save knowledge base to disk:", err.message);
  }
};

// INITIAL LOAD
loadStoreFromDisk();

const getModels = () => {
  if (!embeddingsModel) {
    embeddingsModel = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  if (!chatModel) {
    chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0,
    });
  }
  return { embeddingsModel, chatModel };
};

const clearStore = () => {
  documents = [];
  if (fs.existsSync(KB_FILE)) fs.unlinkSync(KB_FILE);
  console.log("Document store cleared.");
};

const addDocumentToStore = async (textContext) => {
  try {
    documents = [];

    // 🔥 Split by sections (1. 2. 3. ...)
    const sections = textContext.split(/\n\d+\.\s+/).filter(Boolean);

    for (const section of sections) {
      const lines = section.trim().split("\n");
      const title = lines[0].toLowerCase(); // first line = title

      documents.push({
        title,
        content: section,
        vector: null // optional (free mode)
      });
    }

    saveStoreToDisk();
    console.log(`Stored ${documents.length} sections.`);
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

const similaritySearch = (queryVector, k = 4) => {
  const scoredDocs = documents.map(doc => {
    let score = 0;
    if (!doc.vector) return { content: doc.content, score: 0 };

    for (let i = 0; i < queryVector.length; i++) {
      score += queryVector[i] * (doc.vector[i] || 0);
    }
    return { content: doc.content, score };
  });

  return scoredDocs
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};

/**
 * Keyword search with stop-word filtering and section heading detection.
 */
const keywordSearch = (query) => {
  const q = query.toLowerCase();

  const scoredDocs = documents.map(doc => {
    let score = 0;
    const title = (doc.title || '').toLowerCase();
    const content = (doc.content || '').toLowerCase();

    // Strong title match
    if (title && title.includes(q)) score += 1000;

    // keyword match
    q.split(" ").forEach(word => {
      if (word.length < 3) return;
      if (title && title.includes(word)) score += 200;
      if (content.includes(word)) score += 20;
    });

    return { ...doc, score };
  });

  return scoredDocs.sort((a, b) => b.score - a.score)[0];
};

/**
 * Smart local extraction - extracts just the relevant lines without needing AI.
 * Called when OpenAI quota is exceeded.
 */
const smartLocalExtract = (question, context) => {
  const q = question.toLowerCase();

  const isCourseQuestion = /\bcourse\b|\bcourses\b|\bprograms?\b/.test(q);
  const isClubQuestion = /\bclub\b|\bclubs\b/.test(q);
  const isListQuestion = isCourseQuestion || isClubQuestion || /fees|placement|hostel|facility/.test(q);

  // Extract bullet/list items
  const extractListItems = (text) => {
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => {
        if (l.length < 3 || l.length > 150) return false;
        // Match bullets, numbered lists, or program names
        return l.match(/^[•\-\*]/) || l.match(/^\d+\./) || l.match(/^(B\.|M\.|MBA|B\.E|B\.Tech|M\.E|M\.Tech)/i);
      });
  };

  if (isListQuestion) {
    const items = extractListItems(context);
    if (items.length > 0) {
      return items.map(c => `• ${c.replace(/^[•\-\*\d\.]\s*/, '').trim()}`).join('\n');
    }
  }

  // Generic fallback: first 2-3 meaningful sentences only
  const sentences = context
    .replace(/---/g, '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 300);

  return sentences.slice(0, 3).join(' ');
};

const basicChat = async (question) => {
  try {
    const { chatModel } = getModels();
    const response = await chatModel.invoke(question);
    return response.content;
  } catch (error) {
    return "I'm sorry, I'm currently running in limited mode due to an API rate limit. Please try again later or check your OpenAI quota.";
  }
};

const ragChat = async (question) => {
  if (documents.length === 0) {
    return "No documents uploaded.";
  }

  const bestDoc = keywordSearch(question);

  if (!bestDoc || bestDoc.score === 0) {
    return "No relevant information found.";
  }

  return smartLocalExtract(question, bestDoc.content);
};

const getStoreSize = () => documents.length;

module.exports = {
  addDocumentToStore,
  clearStore,
  basicChat,
  ragChat,
  getStoreSize
};
