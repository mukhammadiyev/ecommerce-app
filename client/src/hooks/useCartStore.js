// src/store/useCartStore.js
import { create } from "zustand";

const API_URL = "http://localhost:5000/api"; // O'zingning backend portingga moslab ol

const useCartStore = create((set, get) => ({
  items: [], // [{ id, quantity, product: { id, name, price, stock, image } }]
  loading: false,
  error: null,

  // 1. Savatni backend'dan yuklab olish (GET)
  fetchCart: async () => {
    if (get().loading) return; 
    
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/cart`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Backend formattedCartItems'ni data.cart_items ichida qaytaryapti
        const cartItems = data.data?.cart_items || [];
        set({ items: cartItems, loading: false });
      } else {
        set({ items: [], loading: false, error: data.message });
      }
    } catch (error) {
      console.error("Savatni yuklashda xatolik:", error);
      set({ loading: false, items: [], error: error.message });
    }
  },

  // 2. Savatga mahsulot qo'shish (POST)
  addToCart: async (product, qty = 1) => {
    const currentItems = get().items;
    
    // Diqqat: Yangi backend formatida mahsulot ID'si 'item.product.id' ichida bo'ladi
    const existingItem = currentItems.find((item) => item.product?.id === product.id);
    
    const currentQty = existingItem ? Number(existingItem.quantity) : 0;
    const newQty = currentQty + Number(qty);
    const maxStock = product.stock !== undefined ? Number(product.stock) : 50;

    // Hali backend'ga so'rov ketmasdan oldin front-end tekshiruvi (Tezlik uchun)
    if (newQty > 50 || newQty > maxStock) {
      alert(`Kechirasiz, ushbu mahsulotdan jami limit 50 ta! Hozir savatda: ${currentQty} ta bor.`);
      return; 
    }

    set({ loading: true });
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: qty
        })
      });

      const data = await response.json();

      if (response.ok) {
        set({ loading: false });
        // Bazaga muvaffaqiyatli qo'shilgach, savatni yangilaymiz
        await get().fetchCart();
      } else {
        set({ loading: false, error: data.message });
        alert(data.message); // Backend'dan qaytgan xatolikni ko'rsatish
      }
    } catch (error) {
      console.error("Savatga qo'shishda xatolik:", error);
      set({ loading: false });
    }
  },

  // 3. Savatdagi miqdorni o'zgartirish (PUT)
  updateQuantity: async (cartItemId, quantity) => {
    if (quantity <= 0) return;

    const currentItems = get().items;
    const targetItem = currentItems.find((item) => item.id === cartItemId);
    
    if (targetItem) {
      const maxStock = targetItem.product?.stock !== undefined ? Number(targetItem.product.stock) : 50;
      if (quantity > 50 || quantity > maxStock) {
        alert(`Maksimal limit 50 ta! Ombordagi qoldiq: ${maxStock} ta.`);
        return; 
      }
    }

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistik yangilash (UI'da darhol aks ettirish)
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          )
        }));
      } else {
        console.warn("Miqdorni o'zgartirishda xato:", data.message);
        await get().fetchCart(); // Xato bo'lsa bazadagi eski holatni qayta yuklaymiz
      }
    } catch (error) {
      console.error("Miqdorni yangilashda xatolik:", error);
    }
  },

  // 4. Savatdan mahsulotni o'chirish (DELETE)
  removeFromCart: async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        // UI'dan darhol o'chirish
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId)
        }));
      } else {
        console.warn("O'chirishda xato:", data.message);
      }
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
    }
  },

  // 5. Haqiqiy Buyurtma berish (Checkout)
  checkout: async (shippingData) => {
    set({ loading: true });
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address: shippingData.shipping_address,
          phone_number: shippingData.phone_number,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        set({ items: [], loading: false });
        return { success: true, message: data.message || "Buyurtma yaratildi!" };
      } else {
        set({ loading: false });
        return { success: false, message: data.message || "Xatolik yuz berdi" };
      }
    } catch (error) {
      console.error("Sotuv xatoligi:", error);
      set({ loading: false });
      return { success: false, message: "Tarmoq xatoligi yuz berdi!" };
    }
  },

  getTotalItems: () => {
    return get().items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  },
}));

export default useCartStore;