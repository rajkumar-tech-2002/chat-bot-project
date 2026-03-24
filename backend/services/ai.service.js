/**
 * AI Service — TF-IDF + Cosine Similarity (ML-Based)
 * 
 * ML Technique: Term Frequency-Inverse Document Frequency (TF-IDF)
 * Search:       Cosine Similarity between query vector and document vectors
 * 
 * This replaces the old rule-based keyword scoring (+1000/+200/+20)
 * with a proper Machine Learning information retrieval system.
 */

const fs = require('fs');
const path = require('path');

const KB_FILE = path.join(__dirname, '../knowledge_base.json');

// In-memory store: each doc has { title, content, tf, tfidfVector }
let documents = [];
// Global IDF scores: { term: idfScore }
let idfScores = {};

// ─────────────────────────────────────────────────────────────
// STOP WORDS — common English words that carry no meaning
// ─────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the','is','at','which','on','and','a','an','to','in','it','of','for',
  'with','as','by','this','that','are','was','were','be','been','being',
  'have','has','had','do','does','did','but','if','or','so','from','not',
  'no','their','they','its','our','you','your','we','us','he','she','his',
  'her','me','my','am','all','can','will','more','also','into','than','about',
  'up','out','after','before','between','during','through','over','under',
  'per','each','any','some','than','then','when','where','who','what','how',
  'both','such','there','here','these','those','should','would','could'
]);

// ─────────────────────────────────────────────────────────────
// TOKENIZER — lowercase, remove punctuation, filter stop words
// ─────────────────────────────────────────────────────────────
const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
};

// ─────────────────────────────────────────────────────────────
// TERM FREQUENCY (TF) — how often a term appears in a document
// TF(t,d) = count(t in d) / total terms in d
// ─────────────────────────────────────────────────────────────
const computeTF = (tokens) => {
  const tf = {};
  tokens.forEach(t => tf[t] = (tf[t] || 0) + 1);
  const total = tokens.length || 1;
  Object.keys(tf).forEach(t => tf[t] /= total);
  return tf;
};

// ─────────────────────────────────────────────────────────────
// INVERSE DOCUMENT FREQUENCY (IDF) — how rare a term is globally
// IDF(t) = log((N+1) / (df(t)+1)) + 1  [smoothed]
// Rare terms in few docs get HIGH IDF → more important
// ─────────────────────────────────────────────────────────────
const computeIDF = (tfDocs) => {
  const N = tfDocs.length;
  const idf = {};
  const allTerms = new Set(tfDocs.flatMap(d => Object.keys(d.tf)));
  allTerms.forEach(term => {
    const docCount = tfDocs.filter(d => d.tf[term] !== undefined).length;
    idf[term] = Math.log((N + 1) / (docCount + 1)) + 1;
  });
  return idf;
};

// ─────────────────────────────────────────────────────────────
// TF-IDF VECTOR — combines TF and IDF for each term
// TFIDF(t,d) = TF(t,d) × IDF(t)
// ─────────────────────────────────────────────────────────────
const computeTFIDFVector = (tf, idf) => {
  const vector = {};
  Object.keys(tf).forEach(term => {
    if (idf[term]) vector[term] = tf[term] * idf[term];
  });
  return vector;
};

// ─────────────────────────────────────────────────────────────
// COSINE SIMILARITY — angle between two TF-IDF vectors
// Score of 1.0 = identical meaning, 0.0 = no relation
// ─────────────────────────────────────────────────────────────
const cosineSimilarity = (vecA, vecB) => {
  const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  terms.forEach(t => {
    const a = vecA[t] || 0;
    const b = vecB[t] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// ─────────────────────────────────────────────────────────────
// BUILD TF-IDF INDEX — called after documents are loaded/updated
// ─────────────────────────────────────────────────────────────
const buildIndex = () => {
  if (documents.length === 0) return;

  // Step 1: Compute TF for every document chunk
  const tfDocs = documents.map(doc => ({
    ...doc,
    tf: computeTF(tokenize(doc.content))
  }));

  // Step 2: Compute global IDF scores across all chunks
  idfScores = computeIDF(tfDocs);

  // Step 3: Compute final TF-IDF vectors and update documents
  documents = tfDocs.map(doc => ({
    title: doc.title,
    content: doc.content,
    tf: doc.tf,
    tfidfVector: computeTFIDFVector(doc.tf, idfScores)
  }));

  console.log(`[TF-IDF] Index built: ${documents.length} chunks, ${Object.keys(idfScores).length} unique terms.`);
};

// ─────────────────────────────────────────────────────────────
// PERSISTENCE — load / save knowledge base to disk
// ─────────────────────────────────────────────────────────────
const loadStoreFromDisk = () => {
  try {
    if (fs.existsSync(KB_FILE)) {
      const data = fs.readFileSync(KB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Strip pre-computed vectors so we rebuild fresh (ensures consistency)
      documents = parsed.map(d => ({ title: d.title, content: d.content }));
      buildIndex();
      console.log(`[TF-IDF] Loaded ${documents.length} chunks from disk.`);
    }
  } catch (err) {
    console.warn('[TF-IDF] Failed to load knowledge base:', err.message);
  }
};

const saveStoreToDisk = () => {
  try {
    // Save only title + content (vectors are re-computed on load)
    const toSave = documents.map(d => ({ title: d.title, content: d.content }));
    fs.writeFileSync(KB_FILE, JSON.stringify(toSave, null, 2));
    console.log(`[TF-IDF] Saved ${documents.length} chunks to disk.`);
  } catch (err) {
    console.error('[TF-IDF] Failed to save knowledge base:', err.message);
  }
};

// Initial load on server start
loadStoreFromDisk();

// ─────────────────────────────────────────────────────────────
// CLEAR STORE
// ─────────────────────────────────────────────────────────────
const clearStore = () => {
  documents = [];
  idfScores = {};
  if (fs.existsSync(KB_FILE)) fs.unlinkSync(KB_FILE);
  console.log('[TF-IDF] Document store cleared.');
};

// ─────────────────────────────────────────────────────────────
// ADD DOCUMENT — parse text into chunks, build TF-IDF index
// ─────────────────────────────────────────────────────────────
const addDocumentToStore = async (textContent) => {
  try {
    documents = [];

    // Split by numbered sections: "1. Title", "2. Section", etc.
    const sections = textContent.split(/\n\d+\.\s+/).filter(Boolean);

    for (const section of sections) {
      const lines = section.trim().split('\n');
      const title = lines[0].toLowerCase().trim();
      if (section.trim().length < 10) continue; // skip empty sections
      documents.push({ title, content: section });
    }

    // If no numbered sections found, chunk by paragraphs
    if (documents.length <= 1) {
      documents = [];
      const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim().length > 30);
      paragraphs.forEach((para, i) => {
        const lines = para.trim().split('\n');
        documents.push({
          title: lines[0].toLowerCase().trim(),
          content: para.trim()
        });
      });
    }

    // Build TF-IDF vectors for all chunks
    buildIndex();
    saveStoreToDisk();

    console.log(`[TF-IDF] Stored and indexed ${documents.length} sections.`);
  } catch (error) {
    console.error('[TF-IDF] Error adding document:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// TF-IDF SEARCH — find the most semantically similar chunk
// Uses cosine similarity between query vector and all doc vectors
// ─────────────────────────────────────────────────────────────
const tfidfSearch = (query, topK = 2) => {
  if (documents.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const queryTF = computeTF(queryTokens);
  const queryVector = computeTFIDFVector(queryTF, idfScores);

  const scored = documents.map(doc => ({
    title: doc.title,
    content: doc.content,
    score: cosineSimilarity(queryVector, doc.tfidfVector || {})
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(d => d.score > 0);
};

// ─────────────────────────────────────────────────────────────
// ANSWER EXTRACTOR — pulls the most relevant lines from context
// ─────────────────────────────────────────────────────────────
const extractAnswer = (question, context) => {
  const q = question.toLowerCase();

  const isListQuestion = /\bcourse|courses|programs?|club|clubs|fee|fees|hostel|facility|facilities|placement\b/.test(q);

  if (isListQuestion) {
    const listItems = context.split('\n')
      .map(l => l.trim())
      .filter(l => {
        if (l.length < 3 || l.length > 200) return false;
        return l.match(/^[•\-\*]/) || l.match(/^\d+\./) || l.match(/^(B\.|M\.|MBA|B\.E|B\.Tech|M\.E|M\.Tech)/i);
      });

    if (listItems.length > 0) {
      return listItems.map(c => `• ${c.replace(/^[•\-\*\d\.]\s*/, '').trim()}`).join('\n');
    }
  }

  // For general questions: return first 3 meaningful sentences
  const sentences = context
    .replace(/---/g, '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 400);

  return sentences.slice(0, 3).join(' ');
};

// ─────────────────────────────────────────────────────────────
// RAG CHAT — ML-powered question answering
// 1. TF-IDF search for best matching chunks
// 2. Merge top-k context
// 3. Extract precise answer
// ─────────────────────────────────────────────────────────────
const ragChat = async (question) => {
  if (documents.length === 0) {
    return 'No documents have been uploaded yet. Please ask the admin to upload campus documents.';
  }

  const topDocs = tfidfSearch(question, 2);

  if (topDocs.length === 0 || topDocs[0].score === 0) {
    return 'I could not find relevant information for your question. Please try rephrasing or ask a different question.';
  }

  // Merge top-2 chunks for richer context
  const context = topDocs.map(d => d.content).join('\n---\n');

  console.log(`[TF-IDF] Query: "${question}" | Best match: "${topDocs[0].title}" (score: ${topDocs[0].score.toFixed(4)})`);

  return extractAnswer(question, context);
};

// ─────────────────────────────────────────────────────────────
// BASIC CHAT — direct OpenAI fallback (for general questions)
// ─────────────────────────────────────────────────────────────
const basicChat = async (question) => {
  try {
    const { ChatOpenAI } = require('@langchain/openai');
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0,
    });
    const response = await model.invoke(question);
    return response.content;
  } catch (error) {
    return "I'm currently running in limited mode. Please try again later.";
  }
};

const getStoreSize = () => documents.length;

module.exports = {
  addDocumentToStore,
  clearStore,
  basicChat,
  ragChat,
  getStoreSize,
};
