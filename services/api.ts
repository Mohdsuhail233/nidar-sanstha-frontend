import axios from 'axios';

const API_BASE_URL = "https://api.duaekhairfoundation.org"

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
    // Don't send token on verify requests - public endpoint for QR scanners (no account needed)
    const isPublicEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/form/verify');
    if (token && !isPublicEndpoint) {
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
  (response) => {
    // Recursively rewrite Oracle URLs to proxy URLs in response data
    const rewriteUrls = (obj: any): any => {
      if (!obj) return obj;
      if (obj instanceof Blob || obj instanceof ArrayBuffer) return obj;
      if (typeof obj === 'string') {
        // Handle full Oracle URLs
        if (obj.includes('oraclecloud.com') && obj.startsWith('http')) {
          return `${API_BASE_URL}/api/files/view?path=${encodeURIComponent(obj)}`;
        }
        // Handle relative proxy paths by adding the Base URL
        if (obj.startsWith('/api/files/view')) {
          return `${API_BASE_URL}${obj}`;
        }
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(rewriteUrls);
      }
      if (typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = rewriteUrls(obj[key]);
        }
        return newObj;
      }
      return obj;
    };
    
    response.data = rewriteUrls(response.data);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("CRITICAL: Backend server at " + API_BASE_URL + " is unreachable.");
      return Promise.reject({
        message: "Server unreachable. Please try again later.",
        isNetworkError: true
      });
    }

    // Agar token expire ho gaya ya galat hai (401 ya 403)
    // NOTE: Verification page public hai (QR scanners ka koi account nahi hota)
    // Isliye /form/verify path pe login redirect nahi karna
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token'); // Purana token saaf karo
      const isVerifyPage = window.location.pathname.includes('/form/verify');
      if (!window.location.pathname.includes('/login') && !isVerifyPage) {
        window.location.pathname = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getFileUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const str = url.trim();
  if (str.startsWith('http://') || str.startsWith('https://')) {
    // If it's an Oracle URL, convert it to our proxy URL
    if (str.includes('oraclecloud.com')) {
      return `${API_BASE_URL}/api/files/view?path=${encodeURIComponent(str)}`;
    }
    return str;
  }
  // For relative paths or filenames
  return `${API_BASE_URL}/api/files/view?path=${encodeURIComponent(str)}`;
};

export default api;