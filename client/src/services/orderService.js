import axios from 'axios';

// Backend ishlayotgan asosiy URL (agar sizda port boshqacha bo'lsa, o'zgartirib qo'ying)
const API_URL = 'http://localhost:5000/api/orders';

// Har bir so'rovga foydalanuvchi/admin tokenini sarlavha (Header) sifatida qo'shish funksiyasi
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Token qayerda saqlanayotgan bo'lsa
  return {
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  };
};

const adminOrderService = {
  // 1. Admin uchun barcha buyurtmalarni bazadan tortib kelish
  getAllOrdersForAdmin: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/all`, getAuthHeaders());
      return response.data; // Backenddan { success: true, data: [...] } qaytadi
    } catch (error) {
      // Xatolik yuz bersa, backenddan kelgan xabarni yoki standart xabarni qaytaramiz
      throw error.response?.data || new Error("Buyurtmalarni yuklashda xatolik yuz berdi");
    }
  },

  // 2. Admin buyurtma statusini yangilashi uchun (pending, processing, shipped, delivered, cancelled)
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/${orderId}/status`, 
        { status: newStatus }, 
        getAuthHeaders()
      );
      return response.data; // Backenddan { success: true, message: "..." } qaytadi
    } catch (error) {
      throw error.response?.data || new Error("Statusni yangilashda xatolik yuz berdi");
    }
  }
};

export default adminOrderService;