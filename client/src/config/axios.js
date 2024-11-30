import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://webapp-backend.ah1ajr.easypanel.host'  // In production, use the full backend URL
    : process.env.REACT_APP_API_URL || 'http://localhost:5000', // In development, use localhost or env variable
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error details
    console.log('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
