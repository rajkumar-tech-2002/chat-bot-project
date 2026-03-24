import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Enable Sending Cookies in every request
axios.defaults.withCredentials = true;

export const basicChat = async (question, visitor_id) => {
  const response = await axios.post(`${API_URL}/chat/basic`, { question, visitor_id });
  return response.data;
};

export const ragChat = async (question, visitor_id) => {
  const response = await axios.post(`${API_URL}/chat/rag`, { question, visitor_id });
  return response.data;
};

export const registerVisitor = async (visitorData) => {
    const response = await axios.post(`${API_URL}/visitors`, visitorData);
    return response.data;
};

export const lookupVisitor = async (mobile) => {
    const response = await axios.get(`${API_URL}/visitors/lookup/${mobile}`);
    return response.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await axios.post(`${API_URL}/documents/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const clearKnowledgeBase = async () => {
    const response = await axios.delete(`${API_URL}/documents/clear`);
    return response.data;
};

export const login = async (user_id, password) => {
  const response = await axios.post(`${API_URL}/users/login`, { user_id, password });
  return response.data;
};

export const logout = async () => {
    const response = await axios.post(`${API_URL}/users/logout`);
    return response.data;
};

export const verifySession = async () => {
    const response = await axios.get(`${API_URL}/users/verify`);
    return response.data;
};

export const saveAudio = async (formData) => {
    const response = await axios.post(`${API_URL}/audio/save`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
