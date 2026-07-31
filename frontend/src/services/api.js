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

// Career endpoints - use fetch directly to avoid axios CORS preflight issues
export const generateMockInterview = async (data) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/api/careers/mock-interview/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return { data: json };
};

export const analyzeCVText = async (formData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/api/careers/cv-analyze/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return { data: json };
};

// Code execution — runs on Django server (no CORS issues)
export const executeCode = async ({ code, language, stdin }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/api/careers/execute/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language, stdin }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json; // { output, error, status }
};

