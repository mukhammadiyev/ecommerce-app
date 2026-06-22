import axios from 'axios';

const API_URL = 'http://localhost:5000/api/newsletter';

// Sarlavhani to'g'ri shakllantirish
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { 
      'Authorization': token ? `Bearer ${token}` : '' 
    }
  };
};

const newsletterService = {
  // Foydalanuvchi obuna bo'lishi uchun (Token shart emas)
  subscribe: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/subscribe`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Obuna bo'lishda xatolik yuz berdi");
    }
  },

  // 🔥 ADMIN BARCHA OBUNACHILARNI KO'RISHI UCHUN
  getAllSubscribers: async () => {
    try {
      // GET so'rovida config (headers) 2-argument bo'ladi!
      const response = await axios.get(`${API_URL}/admin`, getAuthHeaders());
      return response.data; 
    } catch (error) {
      console.error("API Error (getAllSubscribers):", error.response);
      throw error.response?.data || new Error("Obunachilarni yuklashda xatolik yuz berdi");
    }
  },

  // 🔥 OBUNACHILARGA XABAR YUBORISH FUNKSIYASI
  sendNewsletter: async (emailData) => {
    try {
      // POST so'rovida config (headers) 3-argument bo'ladi!
      const response = await axios.post(`${API_URL}/send`, emailData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("API Error (sendNewsletter):", error.response);
      throw error.response?.data || new Error("Xabar yuborishda xatolik yuz berdi");
    }
  }
};

export default newsletterService;