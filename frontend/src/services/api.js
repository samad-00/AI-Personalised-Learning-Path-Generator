import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { API };

export const register = (data) => API.post('/accounts/register/', data);
export const login = (data) => API.post('/accounts/login/', data);
export const getProfile = () => API.get('/accounts/profile/');
export const updateProfile = (data) => API.patch('/accounts/profile/', data);
export const requestOTP = (data) => API.post('/accounts/otp/request/', data);
export const verifyOTP = (data) => API.post('/accounts/otp/verify/', data);

export const generateRoadmap = (data) => API.post('/roadmaps/generate/', data);
export const getRoadmaps = () => API.get('/roadmaps/');
export const getRoadmap = (id) => API.get(`/roadmaps/${id}/`);
export const deleteRoadmap = (id) => API.delete(`/roadmaps/${id}/`);

export const rateResource = (id, data) => API.post(`/roadmaps/resource/${id}/rate/`, data);
export const regenerateWeek = (id) => API.post(`/roadmaps/week/${id}/regenerate/`);
export const getLeaderboard = () => API.get('/roadmaps/leaderboard/');
export const saveNotes = (id, data) => API.post(`/roadmaps/resource/${id}/notes/`, data);
export const getSharedRoadmap = (token) => API.get(`/roadmaps/shared/${token}/`);
export default { register, login, getProfile, requestOTP, verifyOTP, generateRoadmap, getRoadmaps, getRoadmap, deleteRoadmap, rateResource, regenerateWeek, getLeaderboard, saveNotes, getSharedRoadmap };
export const searchResource = (q, type) => API.get(`/roadmaps/search/?q=${encodeURIComponent(q)}&type=${type}`);
export const exportPDF = (id) => API.get(`/roadmaps/${id}/export-pdf/`, { responseType: 'blob' });

// Career endpoints
export const generateMockInterview = (data) => API.post('/careers/mock-interview/', data);
export const analyzeCVText = (formData) => API.post('/careers/cv-analyze/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const executeCode = (data) => API.post('/careers/execute/', data);

export const chatService = {
  sendMessage: (message, sessionId = 'default') => API.post('/chat/', { message, session_id: sessionId }),
  getHistory: (sessionId = 'default') => API.get(`/chat/history/?session_id=${sessionId}`),
  clearHistory: (sessionId = 'default') => API.delete(`/chat/history/?session_id=${sessionId}`)
};
