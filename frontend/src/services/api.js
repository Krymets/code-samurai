/**
 * API service для работы с Django backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register/', userData),
  login: (credentials) => api.post('/login/', credentials),
  getMe: () => api.get('/users/me/'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users/'),
};

// Samurais API
export const samuraisAPI = {
  getAll: (params) => api.get('/samurais/', { params }),
  getMy: () => api.get('/samurais/', { params: { my: true } }),
  getById: (id) => api.get(`/samurais/${id}/`),
  create: (data) => api.post('/samurais/', data),
  update: (id, data) => api.patch(`/samurais/${id}/`, data),
  delete: (id) => api.delete(`/samurais/${id}/`),
  levelUp: (id) => api.post(`/samurais/${id}/level_up/`),
  getTop: () => api.get('/samurais/top/'),
};

// Cards API
export const cardsAPI = {
  getAll: (params) => api.get('/cards/', { params }),
  getById: (id) => api.get(`/cards/${id}/`),
};

// Decks API
export const decksAPI = {
  getMy: () => api.get('/decks/'),
  getById: (id) => api.get(`/decks/${id}/`),
  create: (data) => api.post('/decks/', data),
  update: (id, data) => api.patch(`/decks/${id}/`, data),
  delete: (id) => api.delete(`/decks/${id}/`),
  setActive: (id) => api.post(`/decks/${id}/set_active/`),
};

// Battles API
export const battlesAPI = {
  getAll: (params) => api.get('/battles/', { params }),
  getMy: () => api.get('/battles/', { params: { my: true } }),
  getById: (id) => api.get(`/battles/${id}/`),
  create: (data) => api.post('/battles/', data),
  start: (id) => api.post(`/battles/${id}/start/`),
  run: (id) => api.post(`/battles/${id}/run/`),
  complete: (id, data) => api.post(`/battles/${id}/complete/`, data),
  getEvents: (battleId) => api.get('/battle-events/', { params: { battle_id: battleId } }),
};

// Leaderboard API
export const leaderboardAPI = {
  get: (params) => api.get('/leaderboard/', { params }),
};

// WebSocket connection
export const createBattleWebSocket = (battleId) => {
  const wsUrl = `ws://localhost:8000/ws/battle/${battleId}/`;
  return new WebSocket(wsUrl);
};

export default api;