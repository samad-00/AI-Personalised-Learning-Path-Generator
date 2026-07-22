import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8010/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post('/accounts/register/', data);
export const login = (data) => API.post('/accounts/login/', data);
export const getProfile = () => API.get('/accounts/profile/');
export const updateProfile = (data) => API.patch('/accounts/profile/', data);

export const generateRoadmap = (data) => API.post('/roadmaps/generate/', data);
export const getRoadmaps = () => API.get('/roadmaps/');
export const getRoadmap = (id) => API.get(`/roadmaps/${id}/`);
export const deleteRoadmap = (id) => API.delete(`/roadmaps/${id}/`);

export const rateResource = (id, data) => API.post(`/roadmaps/resource/${id}/rate/`, data);
export const regenerateWeek = (id) => API.post(`/roadmaps/week/${id}/regenerate/`);
export const getLeaderboard = () => API.get('/roadmaps/leaderboard/');
export const saveNotes = (id, data) => API.post(`/roadmaps/resource/${id}/notes/`, data);
export const getSharedRoadmap = (token) => API.get(`/roadmaps/shared/${token}/`);
export default { register, login, getProfile, generateRoadmap, getRoadmaps, getRoadmap, deleteRoadmap, rateResource, regenerateWeek, getLeaderboard, saveNotes, getSharedRoadmap };
export const searchResource = (q, type) => API.get(`/roadmaps/search/?q=${encodeURIComponent(q)}&type=${type}`);
export const exportPDF = (id) => API.get(`/roadmaps/${id}/export-pdf/`);