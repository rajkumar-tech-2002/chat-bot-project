// A simple offline mock vector store
class SimpleMemoryVectorStore {
  constructor() {
    this.vectors = [];
  }
  async addDocuments(docs) {
    for (let i = 0; i < docs.length; i++) {
      this.vectors.push({ doc: docs[i] });
    }
  }
  async similaritySearch(query, k) {
    return this.vectors.slice(0, k).map(v => v.doc);
  }
}

let vectorStore = null;

const addDocumentToStore = async (textContext) => {
  if (!vectorStore) {
    console.log("Mock Mode: Initializing Vector Store without OpenAI...");
    vectorStore = new SimpleMemoryVectorStore();
  }
  // Split manually into manageable chunks (mock)
  const chunks = textContext.match(/[\s\S]{1,1000}/g) || [textContext];
  const output = chunks.map(c => ({ pageContent: c }));
  
  await vectorStore.addDocuments(output);
  console.log(`Mock Vector store added ${output.length} document chunks.`);
};

const basicChat = async (question) => {
  return new Promise(resolve => setTimeout(() => {
    resolve("MOCK RESPONSE: I am currently running in Offline/Mock mode. To process real AI logic, you must fund your OpenAI API key credits.");
  }, 1000));
};

const ragChat = async (question) => {
  if (!vectorStore) {
    return "No documents have been uploaded for context yet. Please upload a document first.";
  }
  
  // Retrieve relevant chunks (Mock)
  const results = await vectorStore.similaritySearch(question, 3);
  const contextText = results.map(r => r.pageContent).join('\n---\n').substring(0, 500);

  return new Promise(resolve => setTimeout(() => {
    resolve(`**MOCK RAG RESPONSE:** 
You asked: "${question}".

Because your OpenAI account has $0 balance (Error 429 Rate Limit Exceeded), I have intercepted the request to keep the UI functional! 

Based on your document, here is a snippet of the context I found locally:
*"...${contextText.trim()}..."*`);
  }, 1500));
};

module.exports = {
  addDocumentToStore,
  basicChat,
  ragChat
};
