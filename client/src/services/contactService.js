import axios from 'axios';

// Backend ishlayotgan asosiy manzil (Portingiz boshqacha bo'lsa, o'zgartiring)
const BASE_URL = 'http://localhost:5000/api'; 

/**
 * Foydalanuvchi xabarini backendga yuborish servisi
 * @param {Object} contactData - { name, email, subject, message }
 */
export const sendContactMessage = async (contactData) => {
  try {
    // Backend routeringizdagi router.post('/', ...) yo'liga so'rov yuboriladi
    const response = await axios.post(`${BASE_URL}/contacts`, contactData);
    return response.data;
  } catch (error) {
    // Xatolikni konsolga chiqarish va tepadagi komponentga otish
    console.error("contactService ichida xatolik:", error);
    throw error;
  }
};