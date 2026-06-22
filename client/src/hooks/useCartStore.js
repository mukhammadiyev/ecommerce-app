import { create } from "zustand";

const API_URL = "http://localhost:5000/api";

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  // 1. Savatni yuklash
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
        const cartItems = data.data?.cart_items || data?.cart_items || data.data || [];
        set({ items: Array.isArray(cartItems) ? cartItems : [], loading: false });
      } else {
        set({ items: [], loading: false, error: data.message });
      }
    } catch (error) {
      console.error("Savatni yuklashda xatolik:", error);
      set({ loading: false, items: [], error: error.message });
    }
  },

  // 2. Savatga mahsulot qo'shish (Cheksiz miqdorda)
  addToCart: async (product, qty = 1) => {
    const currentItems = get().items;
    const rawId = product.id || product._id || product.product_id;
    const targetProductId = Number(rawId) ? Number(rawId) : String(rawId);
    
    const existingItem = currentItems.find((item) => {
      const cartProdId = item.product?.id || item.product?._id || item.product_id || item.id;
      return String(cartProdId) === String(targetProductId);
    });

    if (existingItem) {
      const currentQty = Number(existingItem.quantity || 0);
      const newQty = currentQty + Number(qty);
      
      const cartItemId = existingItem.id || existingItem._id;
      await get().updateQuantity(cartItemId, newQty);
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
          product_id: targetProductId,
          quantity: Number(qty)
        })
      });

      const data = await response.json();

      if (response.ok) {
        set({ loading: false });
        await get().fetchCart(); 
      } else {
        set({ loading: false, error: data.message });
      }
    } catch (error) {
      console.error("Savatga qo'shishda xatolik:", error);
      set({ loading: false });
    }
  },

  // 3. Savatdagi mahsulot miqdorini o'zgartirish (Cheksiz miqdorda)
  updateQuantity: async (cartItemId, quantity) => {
    if (quantity <= 0) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: Number(quantity) })
      });

      const data = await response.json();

      if (response.ok) {
        set((state) => ({
          items: state.items.map((item) =>
            (item.id || item._id) === cartItemId ? { ...item, quantity: Number(quantity) } : item
          )
        }));
      } else {
        console.warn("Miqdorni o'zgartirishda xato:", data.message);
        await get().fetchCart();
      }
    } catch (error) {
      console.error("Miqdorni yangilashda xatolik:", error);
    }
  },

  // 4. Savatdan mahsulotni o'chirish
  removeFromCart: async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        set((state) => ({
          items: state.items.filter((item) => (item.id || item._id) !== cartItemId)
        }));
      }
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
    }
  },

  // 5. Savatdagi jami mahsulotlar sonini hisoblash
  getTotalItems: () => {
    return get().items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  },

  // 6. Buyurtma berish (Checkout) — 🔥 KUPON KODI BILAN BIRGA YANGILANDI
  checkoutCart: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping_address: orderData.shipping_address,
          phone_number: orderData.phone_number,
          coupon_code: orderData.coupon_code // 🚀 Kupon kodi endi backend-ga yuboriladi!
        })
      });

      if (!response.ok) {
        const textError = await response.text();
        let parsedMessage = `Server xatosi: ${response.status}`;
        try {
          const jsonErr = JSON.parse(textError);
          parsedMessage = jsonErr.message || parsedMessage;
        } catch (e) {
          // JSON formatda bo'lmagan xatoliklar uchun
        }
        set({ loading: false, error: parsedMessage });
        return { success: false, message: parsedMessage };
      }

      const data = await response.json();
      
      // Muvaffaqiyatli buyurtmadan keyin savatni tozalaymiz
      set({ items: [], loading: false });
      return { success: true, data };

    } catch (error) {
      console.error("Checkout xatoligi:", error);
      set({ loading: false, error: error.message });
      return { success: false, message: error.message };
    }
  }
}));

export default useCartStore;