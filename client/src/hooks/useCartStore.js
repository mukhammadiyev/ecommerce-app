import { create } from "zustand";

const API_URL = "http://localhost:5000/api";

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

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
        // Backend: data.data?.cart_items yoki data?.cart_items
        const cartItems = data.data?.cart_items || data?.cart_items || [];
        set({ items: cartItems, loading: false });
      } else {
        set({ items: [], loading: false, error: data.message });
      }
    } catch (error) {
      console.error("Savatni yuklashda xatolik:", error);
      set({ loading: false, items: [], error: error.message });
    }
  },

  addToCart: async (product, qty = 1) => {
    const currentItems = get().items;
    
    // Backend Integer kutayotgan bo'lsa, raqamga o'giramiz, aks holda String
    const rawId = product.id || product._id || product.product_id;
    const targetProductId = Number(rawId) ? Number(rawId) : String(rawId);
    
    const existingItem = currentItems.find((item) => {
      const cartProdId = item.product?.id || item.product?._id || item.product_id || item.id;
      return String(cartProdId) === String(targetProductId);
    });

    if (existingItem) {
      const currentQty = Number(existingItem.quantity || 0);
      const newQty = currentQty + Number(qty);
      
      if (newQty > 50) {
        alert(`Bitta mahsulotdan jami 50 tadan ko'p buyurtma berish taqiqlangan! Savatda hozir: ${currentQty} ta bor.`);
        return;
      }

      const cartItemId = existingItem.id || existingItem._id;
      await get().updateQuantity(cartItemId, newQty);
      return;
    }

    if (Number(qty) > 50) {
      alert(`Maksimal limit 50 ta!`);
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
          product_id: targetProductId, // Raqam yoki String formatda
          quantity: Number(qty)         // Aniq integer shaklida
        })
      });

      const data = await response.json();

      if (response.ok) {
        set({ loading: false });
        await get().fetchCart(); 
      } else {
        set({ loading: false, error: data.message });
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Savatga qo'shishda xatolik:", error);
      set({ loading: false });
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    if (quantity <= 0) return;

    if (quantity > 50) {
      alert(`Bitta mahsulot uchun ruxsat etilgan maksimal miqdor 50 ta!`);
      return;
    }

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

  getTotalItems: () => {
    return get().items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  },
}));

export default useCartStore;