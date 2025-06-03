import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend-api-url.com/api',
  timeout: 10000,
});

export default api; 