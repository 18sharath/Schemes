import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  login: (email, password) => api.post('/auth/login', { email, password }),
  
  register: (userData) => api.post('/auth/register', userData),

  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  
  updateProfile: (profileData) => api.put('/profile', profileData),
  
  completeProfile: () => api.post('/profile/complete'),
  
  getProfileStatus: () => api.get('/profile/status'),
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: (topK = 10) => api.post('/recommendations', { top_k: topK }),
  
  getQuickRecommendations: (profileData) => api.post('/recommendations/quick', profileData),
  
  getServiceStatus: () => api.get('/recommendations/status'),
};

// Bookmarks API
export const bookmarksAPI = {
  getBookmarks: () => api.get('/bookmarks'),
  
  addBookmark: (scheme) => api.post('/bookmarks', { scheme }),
  
  removeBookmark: (schemeName) => api.delete(`/bookmarks/${encodeURIComponent(schemeName)}`),
  
  checkBookmark: (schemeName) => api.get(`/bookmarks/check/${encodeURIComponent(schemeName)}`),
  
  testReminder: () => api.post('/bookmarks/test-reminder'),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message, messageHistory = []) => 
    api.post('/chatbot/message', { message, messageHistory }),
  
  getStatus: () => api.get('/chatbot/status'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
