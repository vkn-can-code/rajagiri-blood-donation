// This file is src/services/api.js
// This is the central file for all API calls.

import axios from 'axios';

// Use relative routing to allow both localhost and ngrok proxies.
export const BASE_URL = process.env.REACT_APP_API_URL || '';
// Export the API URL for requests
export const API_URL = BASE_URL ? `${BASE_URL}/api` : '/api';

// Create a central API instance
const api = axios.create({
  // Use the ngrok URL
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

/**
 * This is an "interceptor". It's a function that runs
 * *before* any API request is sent.
 * It automatically gets the token from localStorage and
 * attaches it to the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;