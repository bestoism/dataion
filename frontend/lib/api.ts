import axios from 'axios';

const api = axios.create({
  // Dia akan pakai URL Hugging Face jika ada, jika tidak (di laptop) pakai localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;