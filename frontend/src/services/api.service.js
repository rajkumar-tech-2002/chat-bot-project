import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Enable Sending Cookies in every request
axios.defaults.withCredentials = true;

export const basicChat = async (question) => {
  const response = await axios.post(`${API_URL}/chat/basic`, { question });
  return response.data;
};

export const ragChat = async (question) => {
  const response = await axios.post(`${API_URL}/chat/rag`, { question });
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
