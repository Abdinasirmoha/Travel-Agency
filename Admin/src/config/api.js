// Central API configuration
// Set VITE_API_URL in your .env file to override the default.
// Example: VITE_API_URL=https://api.yourproductiondomain.com/api
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
