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
    const { embeddingsModel } = getModels();
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    });

    const output = await splitter.createDocuments([textContext]);
    const chunks = output.map(d => d.pageContent);
    
    console.log(`Processing ${chunks.length} chunks...`);
    
    for (const chunk of chunks) {
      let vector = null;
      try {
        vector = await embeddingsModel.embedQuery(chunk);
      } catch (embError) {
        if (documents.length === 0) console.warn("Embeddings failing (quota check). Fallback active.");
      }
      documents.push({ content: chunk, vector });
    }

    saveStoreToDisk();
    console.log(`Document store now has ${documents.length} chunks.`);
  } catch (error) {
    console.error("Error adding document to store:", error);
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
const keywordSearch = (query, k = 3) => {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'your', 'need', 'list', 'about', 'what', 'where', 'provide', 'give', 'show', 'tell', 'can', 'you', 'are', 'all', 'this', 'that', 'from']);
  const queryWords = query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  
  if (queryWords.length === 0) return [];

  const scoredDocs = documents.map(doc => {
    const content = doc.content.toLowerCase();
    let score = 0;
    
    queryWords.forEach(word => {
      const regex = new RegExp(word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
      const count = (content.match(regex) || []).length;
      // Square the word length to strongly prioritize longer, more specific terms
      score += count * (word.length * word.length); 
    });

    // Big boost if any query word appears in the first line (section heading)
    const firstLine = doc.content.trim().split('\n')[0].toLowerCase();
    if (queryWords.some(w => firstLine.includes(w))) {
        score += 200;
    }

    return { content: doc.content, score };
  });

  return scoredDocs
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter(d => d.score > 0);
};

/**
 * Smart local extraction - extracts just the relevant lines without needing AI.
 * Called when OpenAI quota is exceeded.
 */
const smartLocalExtract = (question, context) => {
  const q = question.toLowerCase();

  // Detect question intent
  const isCourseQuestion = /course|program|degree|offered|study|b\.e|b\.tech|m\.e|mba/i.test(q);
  const isListQuestion = isCourseQuestion || /club|fee|fees|placement|company|hostel|facility|department/i.test(q);

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
    return "No documents have been uploaded for context yet. Please upload a document first.";
  }

  let context = "";
  try {
    const { embeddingsModel, chatModel } = getModels();
    
    // Try vector search first
    try {
      const queryVector = await embeddingsModel.embedQuery(question);
      const matches = similaritySearch(queryVector, 4);
      context = matches.map(m => m.content).join("\n\n---\n\n");
    } catch (embError) {
      // Quota exceeded for embeddings, fallback to keyword search
      const matches = keywordSearch(question, 2);
      context = matches.map(m => m.content).join("\n\n---\n\n");
    }

    if (!context || context.trim().length === 0) {
        return "I couldn't find any specific information in the uploaded documents that matches your question.";
    }

    // Try AI generation
    try {
      const prompt = `You are a strict AI assistant.

Follow these rules EXACTLY:
1. Answer ONLY what the user asks.
2. Do NOT include any headings, titles, or section labels.
3. Do NOT explain anything.
4. Do NOT return full paragraphs or large document sections.
5. Extract ONLY the exact answer from the context.

If the question is about courses/programs:
→ Return ONLY the course names as a clean bullet list. One per line. No grouping headings.

If the question is about a specific fact (location, date, number):
→ Return just that fact in one sentence.

If the answer is not in the context → Return: Not found

Context:
${context}

Question: ${question}

Answer:`;

      const response = await chatModel.invoke(prompt);
      const cleanedResponse = response.content.trim();
      return cleanedResponse === "Not found"
        ? "I couldn't find the exact information in the documents."
        : cleanedResponse;
    } catch (aiError) {
      // OpenAI quota exceeded: use smart local extraction (no raw dump)
      const extracted = smartLocalExtract(question, context);
      return extracted && extracted.trim().length > 5
        ? extracted
        : "I found relevant content but couldn't extract a precise answer. Please top up your OpenAI quota for a full AI response.";
    }
  } catch (error) {
    return "I ran into an issue while searching your documents. Please try again.";
  }
};

const getStoreSize = () => documents.length;

module.exports = {
  addDocumentToStore,
  clearStore,
  basicChat,
  ragChat,
  getStoreSize
};
