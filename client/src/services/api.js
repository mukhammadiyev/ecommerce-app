import axios from "axios";

const api = axios.create({
  // Agar .env fayl topilmasa, zaxira sifatida http://localhost:5000/api portini ulaydi
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Har safar so'rov ketayotganda tokenni birga yuborish interceptori
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;