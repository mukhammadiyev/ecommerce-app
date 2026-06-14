import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../../components/product/ProductGrid";
import useCartStore from "../../hooks/useCartStore.js"; 

// ─────────────────────────────────────────────
// CartItem — Komponenti
// ─────────────────────────────────────────────
function CartItem({ item, onRemove, onQuantityChange, index }) {
  const rowRef = useRef(null);

 const productInfo = item.product || {};
const name = productInfo.name || "Mahsulot";
const price = Number(productInfo.price || 0);
const stock = productInfo.stock !== undefined ? Number(productInfo.stock) : 50;
const quantity = Number(item.quantity || 1);

// 🔥 RASMNI TO'G'RI ENGLASH:
// Zustand store'da biz allaqachon product.image'ga rasm url'ini tenglab qo'yganmiz.
// Agar u bo'lmasa backend'dan to'g'ridan-to'g'ri keladigan images massivini tekshiramiz.
const image = productInfo.image || productInfo.images?.[0]?.image_url || item.image;

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        rowRef.current,
        { opacity: 0, x: -28 },
        { opacity: 1, x: 0, duration: 0.45, delay: index * 0.05, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, [index]);

  const handleRemove = () => {
    gsap.to(rowRef.current, {
      opacity: 0,
      x: -36,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.32,
      ease: "power2.in",
      onComplete: () => onRemove(item.id), // CartItem ID orqali backend'dan o'chadi
    });
  };

  const handleQtyChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty < 1) return;

    if (newQty > 50 || newQty > stock) {
      alert(`Kechirasiz, maksimal limit 50 ta! Hozir omborda: ${stock} ta bor.`);
      return;
    }
    
    const qtyEl = rowRef.current?.querySelector(".qty-value");
    if (qtyEl) {
      gsap.fromTo(qtyEl, { scale: 0.65, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.5)" });
    }

    onQuantityChange(item.id, newQty); // Backend'da miqdor yangilanadi
  };

  const Thumbnail = () => (
    <div className="shrink-0 w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );

  const QtyControl = () => (
    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white h-9">
      <button onClick={() => handleQtyChange(-1)} className="flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors text-base w-9">−</button>
      <span className="qty-value text-center font-medium text-gray-800 select-none w-7 text-sm">{quantity}</span>
      <button onClick={() => handleQtyChange(1)} className="flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors text-base w-9">+</button>
    </div>
  );

  return (
    <div ref={rowRef} className="border-b border-gray-100 last:border-b-0 overflow-hidden">
      {/* MOBILE */}
      <div className="sm:hidden py-4">
        <div className="flex gap-3">
          <button onClick={handleRemove} className="shrink-0 self-start mt-0.5 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
          <Thumbnail />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-snug">{name}</p>
            <p className="text-sm text-gray-400 mt-0.5">${price.toFixed(2)}</p>
          </div>
          <div className="shrink-0 text-sm font-bold text-gray-900 self-start mt-0.5">${(price * quantity).toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between mt-3 pl-9">
          <span className="text-xs text-gray-400">Quantity</span>
          <QtyControl />
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:flex items-center gap-4 py-4">
        <button onClick={handleRemove} className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-all"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
        <Thumbnail />
        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800">{name}</p></div>
        <div className="w-16 text-center text-sm text-gray-500 shrink-0">${price.toFixed(2)}</div>
        <div className="shrink-0"><QtyControl /></div>
        <div className="w-16 text-right text-sm font-semibold text-gray-800 shrink-0">${(price * quantity).toFixed(2)}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Cart sahifasi (Asosiy qism)
// ─────────────────────────────────────────────
export default function Cart() {
  const items = useCartStore((state) => state.items);
  const loading = useCartStore((state) => state.loading);
  const fetchCart = useCartStore((state) => state.fetchCart); // 🆕 Zustand'dan fetchCart olindi
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [discountInput, setDiscountInput] = useState("");
  const [discountMsg, setDiscountMsg] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const summaryRef = useRef(null);
  const totalRef = useRef(null);
  const btnRef = useRef(null);
  const emptyRef = useRef(null);

  // 🆕 SAHIFA OCHILGANDA BACKEND'DAN SAVATNI TORTIB KELISH
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sahifa birinchi marta ochilgandagi chiroyli animatsiyalar
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
      if (summaryRef.current) {
        gsap.fromTo(
          summaryRef.current,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.5, delay: 0.1, ease: "power2.out" }
        );
      }
    });
    return () => ctx.revert();
  }, [loading]); // Loading tugagandan keyin animatsiya elementlarini to'g'ri hisoblaydi

  // Jami summa o'zgarganda faqat 1 marta chiroyli effekt berish
  useEffect(() => {
    if (!totalRef.current || items.length === 0) return;
    
    const anim = gsap.fromTo(
      totalRef.current,
      { scale: 1.04, opacity: 0.8 },
      { scale: 1, opacity: 1, duration: 0.25, ease: "power1.out" }
    );
    return () => anim.kill();
  }, [items.length, appliedDiscount]);

  useEffect(() => {
    if (items.length === 0 && emptyRef.current) {
      gsap.fromTo(
        emptyRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
      );
    }
  }, [items.length]);

  const subtotal = items.reduce((sum, i) => {
    const itemPrice = Number(i.product?.price || 0);
    const itemQty = Number(i.quantity || 0);
    return sum + (itemPrice * itemQty);
  }, 0);

  const discountAmount = appliedDiscount ? Math.round(subtotal * appliedDiscount) : 0;
  const total = subtotal - discountAmount;

  const handleApplyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (code === "SAVE10") {
      setAppliedDiscount(0.1);
      setDiscountMsg("✓ 10% off applied");
    } else if (code === "SAVE20") {
      setAppliedDiscount(0.2);
      setDiscountMsg("✓ 20% off applied");
    } else {
      setAppliedDiscount(null);
      setDiscountMsg("Invalid code");
    }
    
    gsap.fromTo(
      ".discount-feedback",
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.25 }
    );
  };

  const handleCheckout = () => {
    gsap.to(btnRef.current, {
      scale: 0.96,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        navigate("/checkout");
      }
    });
  };

  // 🆕 Ma'lumot yuklanayotgan paytda "Loader" ko'rsatish (UX yaxshilash uchun)
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-5 2xl:py-10 mb-12 sm:mb-20 flex flex-col gap-12">
        
        {items.length === 0 ? (
          <div ref={emptyRef} className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 py-20 px-6 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 border border-gray-100">
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <path d="M5 5H7.5L10.5 22H27L30 11H12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="14" cy="27" r="2" fill="#9CA3AF" />
                <circle cx="24" cy="27" r="2" fill="#9CA3AF" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mb-6">Looks like you haven't added anything yet.</p>
            <button onClick={() => navigate("/products")} className="bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-700 active:scale-95 transition-all duration-200">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div ref={headerRef} className="hidden sm:flex items-center gap-4 px-5 py-4 bg-[#A6A6A6] border-b border-gray-200">
                <div className="w-7 shrink-0" />
                <div className="w-14 shrink-0" />
                <span className="flex-1 text-xs font-semibold text-white uppercase tracking-wider">Product</span>
                <span className="w-16 text-center text-xs font-semibold text-white uppercase tracking-wider shrink-0">Price</span>
                <span className="w-24 text-center text-xs font-semibold text-white uppercase tracking-wider shrink-0">Quantity</span>
                <span className="w-16 text-right text-xs font-semibold text-white uppercase tracking-wider shrink-0">Total</span>
              </div>
              
              <div className="sm:hidden px-4 py-3 bg-[#A6A6A6] border-b border-gray-200">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">Your Items</span>
              </div>

              <div className="px-4 sm:px-5">
                {items.map((item, i) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    index={i}
                    onRemove={removeFromCart} 
                    onQuantityChange={updateQuantity} 
                  />
                ))}
              </div>

              <div onClick={() => navigate("/products")} className="px-4 sm:px-5 py-4 border-t border-gray-100 flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors group cursor-pointer">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <button className="text-sm font-medium">Continue Shopping</button>
              </div>
            </div>

            <div ref={summaryRef} className="w-full lg:w-80 xl:w-84 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-[#A6A6A6] border-b border-gray-200">
                <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Cart Total</h2>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Discount</span>
                  <span className={`text-sm font-medium ${discountAmount > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {discountAmount > 0 ? `-$${discountAmount}` : "—"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                      placeholder="Discount code"
                      className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-150"
                    />
                    <button onClick={handleApplyDiscount} className="shrink-0 text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 active:scale-95 transition-all duration-150">
                      Apply
                    </button>
                  </div>
                  {discountMsg && (
                    <p className={`discount-feedback text-xs font-medium ${appliedDiscount ? "text-green-600" : "text-red-500"}`}>
                      {discountMsg}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Try SAVE10 or SAVE20</p>
                </div>

                <div ref={totalRef} className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Total</span>
                  <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>

                <button
                  ref={btnRef}
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide bg-gray-900 text-white hover:bg-gray-700 transition-all duration-200"
                >
                  Proceed To Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        <ProductGrid />
      </div>
    </div>
  );
}