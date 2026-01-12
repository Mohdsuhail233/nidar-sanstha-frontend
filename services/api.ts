
import axios from 'axios';

// Ensure the URL matches your Spring Boot server address exactly
const API_BASE_URL = "http://129.154.232.213:8080"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // Removed hardcoded Content-Type to allow browser/axios to set it correctly
  // depending on whether we send JSON or FormData (with files).
});

// Response interceptor for better error reporting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("CRITICAL: Backend server at " + API_BASE_URL + " is unreachable.");
      return Promise.reject({
        message: "  server unreachable. Please try again later.",
        isNetworkError: true
      });
    }

    if (error.response?.status === 401) {
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
