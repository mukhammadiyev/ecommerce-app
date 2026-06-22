import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  };
};

const adminOrderService = {
  // ==========================================
  // FOYDALANUVCHI UCHUN FUNKSIYALAR (YANGI)
  // ==========================================
  
  // Foydalanuvchi o'z buyurtmalari tarixini olishi uchun
  getMyOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/my-orders`, getAuthHeaders());
      return response.data; // { success: true, data: [...] }
    } catch (error) {
      throw error.response?.data || new Error("Buyurtmalarni yuklashda xatolik yuz berdi");
    }
  },

  // Foydalanuvchi o'z buyurtmasini bekor qilishi uchun
  cancelMyOrder: async (orderId) => {
    try {
      const response = await axios.put(`${API_URL}/${orderId}/cancel`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Buyurtmani bekor qilishda xatolik yuz berdi");
    }
  },

  // ==========================================
  // ADMIN UCHUN FUNKSIYALAR (ESKI)
  // ==========================================
  getAllOrdersForAdmin: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/all`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Buyurtmalarni yuklashda xatolik yuz berdi");
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/${orderId}/status`, 
        { status: newStatus }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error("Statusni yangilashda xatolik yuz berdi");
    }
  }
};

export default adminOrderService;