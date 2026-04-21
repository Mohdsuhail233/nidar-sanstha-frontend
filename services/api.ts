import axios from 'axios';

const API_BASE_URL = "https://nidarsanstha.xyz"

const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials ko hata sakte ho kyunki ab hum cookies use nahi kar rahe
  // withCredentials: true, 
});

// --- REQUEST INTERCEPTOR: Har request ke saath token bhejne ke liye ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Don't send token on login requests - stale tokens cause "Invalid Credentials"
    if (token && !config.url?.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR: Error handle karne ke liye ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("CRITICAL: Backend server at " + API_BASE_URL + " is unreachable.");
      return Promise.reject({
        message: "Server unreachable. Please try again later.",
        isNetworkError: true
      });
    }

    // Agar token expire ho gaya ya galat hai (401 ya 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token'); // Purana token saaf karo
      if (!window.location.pathname.includes('/login')) {
        window.location.pathname = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;