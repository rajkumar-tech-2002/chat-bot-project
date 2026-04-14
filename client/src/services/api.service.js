import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Enable Sending Cookies in every request
axios.defaults.withCredentials = true;

export const basicChat = async (question, visitor_id, session_id) => {
  const response = await axios.post(`${API_URL}/chat/basic`, { question, visitor_id, session_id });
  return response.data;
};

export const ragChat = async (question, visitor_id, session_id) => {
  const response = await axios.post(`${API_URL}/chat/rag`, { question, visitor_id, session_id });
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

export const updateVisitorEmail = async (id, email) => {
    const response = await axios.put(`${API_URL}/visitors/${id}/email`, { email });
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

export const getAllDocuments = async () => {
    const response = await axios.get(`${API_URL}/documents`);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await axios.delete(`${API_URL}/documents/${id}`);
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

export const endSession = async (visitor_id, session_id) => {
    const response = await axios.post(`${API_URL}/chat/end-session`, { visitor_id, session_id });
    return response.data;
};

// Admin Services
export const getAdminStats = async () => {
    const response = await axios.get(`${API_URL}/admin/stats`);
    return response.data;
};

export const getAdminActivity = async (filters = {}) => {
    const response = await axios.get(`${API_URL}/admin/activity`, { params: filters });
    return response.data;
};

export const getAdminVisitors = async () => {
    const response = await axios.get(`${API_URL}/admin/visitors`);
    return response.data;
};

// ── Avatar Services ──────────────────────────────────────────────────────────
export const getAvatars = async () => {
    const response = await axios.get(`${API_URL}/avatars`);
    return response.data;
};

export const createAvatar = async (formData) => {
    const response = await axios.post(`${API_URL}/avatars`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteAvatar = async (id) => {
    const response = await axios.delete(`${API_URL}/avatars/${id}`);
    return response.data;
};

export const updateAvatar = async (id, data) => {
    const response = await axios.put(`${API_URL}/avatars/${id}`, data);
    return response.data;
};
