// BU KOD O'Z HOLICHA QOLADI, FAQAT TEKSHIRIB OLING:
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/coupons';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const couponService = {
  getAllCoupons: async () => {
    const response = await axios.get(`${API_URL}/`, getAuthHeaders());
    return response.data;
  },

  checkCoupon: async (code) => {
    const response = await axios.get(`${API_URL}/check/${code.trim().toUpperCase()}`, getAuthHeaders());
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await axios.post(`${API_URL}/`, couponData, getAuthHeaders());
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  }
};

export default couponService;