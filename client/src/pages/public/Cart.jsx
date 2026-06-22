import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../../components/product/ProductGrid";
import useCartStore from "../../hooks/useCartStore.js";
import couponService from "../../services/couponService";

function CartItem({ item, onRemove, onQuantityChange, index }) {
  const rowRef = useRef(null);
  const productInfo = item.product || {};
  const name = productInfo.name || item.name || "Mahsulot";
  const price = Number(productInfo.price || item.price || 0);
  const stock = productInfo.stock !== undefined ? Number(productInfo.stock) : 999999;
  const quantity = Number(item.quantity || 1);

  const getFullUrl = (rawPath) => {
    if (!rawPath) return null;
    let url = Array.isArray(rawPath) ? rawPath[0] : rawPath;
    if (typeof url === "object") url = url.url || url.image || url.image_url;
    if (typeof url !== "string") return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    return `http://localhost:5000${url.startsWith("/") ? url : "/" + url}`;
  };

  const rawImage = productInfo.image || productInfo.image_url || item.image || item.image_url || productInfo.images?.[0];
  const image = getFullUrl(rawImage);

  useEffect(() => {
    if (!rowRef.current) return;
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
    if (!rowRef.current) {
      onRemove(item.id || item._id);
      return;
    }
    const itemIdToDelete = item.id || item._id;
    gsap.to(rowRef.current, {
      opacity: 0,
      x: -36,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.32,
      ease: "power2.in",
      onComplete: () => onRemove(itemIdToDelete),
    });
  };

  const handleQtyChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty < 1 || newQty > stock) return;

    const qtyEl = rowRef.current?.querySelector(".qty-value");
    if (qtyEl) {
      gsap.fromTo(qtyEl, { scale: 0.65, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.5)" });
    }

    const itemIdToUpdate = item.id || item._id;
    onQuantityChange(itemIdToUpdate, newQty);
  };

  return (
    <div ref={rowRef} className="border-b border-gray-100 last:border-b-0 overflow-hidden">
      {/* MOBILE */}
      <div className="sm:hidden py-4">
        <div className="flex gap-3">
          <button onClick={handleRemove} className="shrink-0 self-start mt-0.5 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
          <div className="shrink-0 w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
            {image ? <img src={image} alt={name} className="w-full h-full object-contain p-1" /> : <div className="text-gray-300">📦</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{name}</p>
            <p className="text-sm text-gray-400 mt-0.5">${price.toFixed(2)}</p>
          </div>
          <div className="shrink-0 text-sm font-bold text-gray-900 self-start mt-0.5">${(price * quantity).toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between mt-3 pl-9">
          <span className="text-xs text-gray-400">Quantity</span>
          <div className="flex items-center border border-gray-200 rounded-full bg-white h-9">
            <button onClick={() => handleQtyChange(-1)} className="w-9 text-gray-500">−</button>
            <span className="qty-value w-7 text-center text-sm font-medium">{quantity}</span>
            <button onClick={() => handleQtyChange(1)} className="w-9 text-gray-500">+</button>
          </div>
        </div>
      </div>

      {/* DESKTOP - GRID TIZIMIGA O'TKAZILDI (ALIGNMENT MUAMMOSI HAL ETILDI) */}
      <div className="hidden sm:grid grid-cols-[auto_auto_1fr_100px_120px_100px] items-center gap-4 py-4">
        <button onClick={handleRemove} className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-all"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
        <div className="shrink-0 w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
          {image ? <img src={image} alt={name} className="w-full h-full object-contain p-1" /> : <div className="text-gray-300">📦</div>}
        </div>
        <div className="min-w-0 pr-2">
          <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        </div>
        <div className="text-center text-sm text-gray-500">${price.toFixed(2)}</div>
        <div className="flex justify-center">
          <div className="flex items-center border border-gray-200 rounded-full bg-white h-9">
            <button onClick={() => handleQtyChange(-1)} className="w-8 text-gray-500">−</button>
            <span className="qty-value w-8 text-center text-sm font-medium">{quantity}</span>
            <button onClick={() => handleQtyChange(1)} className="w-8 text-gray-500">+</button>
          </div>
        </div>
        <div className="text-right text-sm font-semibold text-gray-800">${(price * quantity).toFixed(2)}</div>
      </div>
    </div>
  );
}

export default function Cart() {
  const items = useCartStore((state) => state.items) || [];
  const loading = useCartStore((state) => state.loading);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [discountInput, setDiscountInput] = useState("");
  const [discountMsg, setDiscountMsg] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const navigate = useNavigate();
  const headerRef = useRef(null);
  const summaryRef = useRef(null);
  const totalRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (typeof fetchCart === "function") fetchCart();
  }, [fetchCart]);

  // 🛠️ HIMOYA OPTIMIZATSIYA QILINDI: Primitiv string orqali reference o'zgarishi va cheksiz render oldi olindi.
  const itemsSignature = items.map(i => `${i.id || i._id}:${i.quantity}`).join(",");
  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setDiscountInput("");
      setDiscountMsg("⚠ Savatcha tarkibi o'zgardi. Kuponni qaytadan kiriting.");
    }
  }, [itemsSignature]); 

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
      }
      if (summaryRef.current) {
        gsap.fromTo(summaryRef.current, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.1, ease: "power2.out" });
      }
    });
    return () => ctx.revert();
  }, [loading, items.length]);

  useEffect(() => {
    if (!totalRef.current || items.length === 0) return;
    const anim = gsap.fromTo(totalRef.current, { scale: 1.04, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.25, ease: "power1.out" });
    return () => anim.kill();
  }, [items.length, appliedCoupon]);

  const subtotal = items.reduce((sum, i) => {
    const itemPrice = Number(i.product?.price || i.price || 0);
    const itemQty = Number(i.quantity || 0);
    return sum + (itemPrice * itemQty);
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discountAmount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === "fixed") {
      discountAmount = Number(appliedCoupon.value);
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyDiscount = async () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;

    try {
      setCheckingCoupon(true);
      setDiscountMsg("");

      const res = await couponService.checkCoupon(code);
      
      if (res.success && res.data) {
        const foundCoupon = res.data;
        setAppliedCoupon(foundCoupon);
        setDiscountMsg(`✓ Kupon qo'llanildi: ${foundCoupon.type === "percentage" ? foundCoupon.value + "%" : "$" + foundCoupon.value} chegirma`);
      }
    } catch (error) {
      setAppliedCoupon(null);
      const errorMsg = error.response?.data?.message || "Kuponni tekshirishda xatolik yuz berdi";
      setDiscountMsg(errorMsg);
    } finally {
      setCheckingCoupon(false);
      
      setTimeout(() => {
        const feedbackEl = document.querySelector(".discount-feedback");
        if (feedbackEl) {
          gsap.fromTo(feedbackEl, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25 });
        }
      }, 50);
    }
  };

  const handleCheckout = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 0.96,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          navigate("/checkout", { state: { couponCode: appliedCoupon?.code, discountAmount } });
        }
      });
    } else {
      navigate("/checkout", { state: { couponCode: appliedCoupon?.code, discountAmount } });
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-5 2xl:py-10 mb-12 sm:mb-20 flex flex-col gap-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 py-20 px-6 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Savatchangiz bo'sh</h2>
            <button onClick={() => navigate("/products")} className="mt-4 bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-700 transition-all">
              Xaridni boshlash
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* DESKTOP SARLAVHASI GRID SYSTEM BILAN MOSLASHTIRILDI */}
              <div ref={headerRef} className="hidden sm:grid grid-cols-[auto_auto_1fr_100px_120px_100px] gap-4 px-5 py-4 bg-[#A6A6A6] border-b border-gray-200">
                <div className="w-7 shrink-0" />
                <div className="w-14 shrink-0" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">Mahsulot</span>
                <span className="text-center text-xs font-semibold text-white uppercase tracking-wider">Narxi</span>
                <span className="text-center text-xs font-semibold text-white uppercase tracking-wider">Soni</span>
                <span className="text-right text-xs font-semibold text-white uppercase tracking-wider">Jami</span>
              </div>

              <div className="px-4 sm:px-5">
                {items.map((item, i) => (
                  <CartItem key={item.id || item._id || i} item={item} index={i} onRemove={removeFromCart} onQuantityChange={updateQuantity} />
                ))}
              </div>
            </div>

            <div ref={summaryRef} className="w-full lg:w-80 xl:w-84 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-[#A6A6A6] border-b border-gray-200">
                <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Buyurtma Hisobi</h2>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Oraliq narx</span>
                  <span className="text-sm font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Chegirma</span>
                  <span className={`text-sm font-medium ${discountAmount > 0 ? "text-green-600" : "text-gray-400"}`}>
                    {discountAmount > 0 ? `-$${discountAmount.toFixed(2)}` : "—"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                      placeholder="Kupon kodi"
                      className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                    />
                    <button 
                      onClick={handleApplyDiscount} 
                      disabled={checkingCoupon}
                      className="shrink-0 text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {checkingCoupon ? "..." : "Kiritish"}
                    </button>
                  </div>
                  {discountMsg && (
                    <p className={`discount-feedback text-xs font-medium ${appliedCoupon ? "text-green-600" : "text-red-500"}`}>
                      {discountMsg}
                    </p>
                  )}
                </div>

                <div ref={totalRef} className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Jami</span>
                  <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>

                <button
                  ref={btnRef}
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide bg-gray-900 text-white hover:bg-gray-700 transition-all duration-200"
                >
                  Xaridni Rasmiylashtirish
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