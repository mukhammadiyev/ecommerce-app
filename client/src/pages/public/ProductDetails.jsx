import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCartStore from "../../hooks/useCartStore.js";
import { getProducts } from "../../services/productService.js";

gsap.registerPlugin(ScrollTrigger);

const BASE_URL = "http://localhost:5000";

/* ══════════════════════════════════════════
    ICONS
══════════════════════════════════════════ */
function StarIcon({ filled = true, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#1a1a2e" : "none"} stroke="#1a1a2e" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HeartIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#e05" : "none"} stroke={active ? "#e05" : "#aaa"} strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ══════════════════════════════════════════
    SUB-COMPONENTS
══════════════════════════════════════════ */
function Stars({ count = 5, max = 5, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon key={i} filled={i < count} size={size} />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
          <span className="text-sm font-semibold text-[#1a1a2e]">{review.author}</span>
        </div>
        <Stars count={review.rating} size={13} />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{review.body}</p>
      <div className="flex items-center gap-3 mt-3">
        <button className="text-xs text-gray-500 hover:text-[#1a1a2e] transition-colors">Like</button>
        <button className="text-xs text-gray-500 hover:text-[#1a1a2e] transition-colors">Reply</button>
        <span className="text-xs text-gray-400">{review.time}</span>
      </div>
    </div>
  );
}

function ReviewForm() {
  const [form, setForm] = useState({ name: "", email: "", body: "", rating: 0, hover: 0 });
  return (
    <div className="border border-gray-300 rounded-2xl p-4 sm:p-5 bg-gray-50 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Your Name:</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="John Doe"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Your Email:</label>
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="person@gmail.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
          />
        </div>
      </div>
      <div className="mb-3">
        <textarea
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          placeholder="Write your review..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-gray-400 transition-colors bg-white"
        />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Your Ratings:</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setForm((p) => ({ ...p, hover: star }))}
                onMouseLeave={() => setForm((p) => ({ ...p, hover: 0 }))}
                onClick={() => setForm((p) => ({ ...p, rating: star }))}
              >
                <StarIcon filled={star <= (form.hover || form.rating)} size={16} />
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a2e] text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#2d2d4e] transition-colors">
          Post Review
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Mike Johnson",
    rating: 5,
    time: "5m",
    body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Diam nisl, cras neque, lorem vel vulputate vitae aliquam. Pretium tristique nisl ut commodo fames.",
  },
];

/* ══════════════════════════════════════════
    MAIN COMPONENT
══════════════════════════════════════════ */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── 🛠 ZUSTAND STORE SELECTION ── */
  const cartItems = useCartStore((state) => state.items) || [];
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const fetchCart = useCartStore((state) => state.fetchCart);

  /* ── data state ── */
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  /* ── ui state ── */
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [tab, setTab] = useState("description");

  /* ── refs ── */
  const pageRef = useRef(null);
  const breadcrumbRef = useRef(null);
  const galleryRef = useRef(null);
  const infoRef = useRef(null);
  const tabSectionRef = useRef(null);
  const tabContentRef = useRef(null);

  /* ── Savatni bir marta yuklash ── */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ── fetch product by id ── */
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);

    getProducts()
      .then((response) => {
        if (!isMounted) return;

        const allProducts = response?.data?.data || response?.data || (Array.isArray(response) ? response : []);
        const found = allProducts.find((p) => String(p.id || p._id) === String(id));

        if (found) {
          setProduct(found);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Detail yuklashda xatolik:", err);
        if (isMounted) setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  /* ── 🛠 SAVATDAGI MIQDOR BILAN MUTLOQ XAVFSIZ SINXRONLASH EFFECTI ── */
  useEffect(() => {
    if (!product) return;
    
    const currentId = String(product.id || product._id || product.product_id);
    const existingItem = cartItems.find((item) => {
      const cartProdId = String(item.product?.id || item.product?._id || item.product_id || item.id);
      return cartProdId === currentId;
    });

    if (existingItem) {
      setQty(Number(existingItem.quantity || 1));
    } else {
      setQty(1);
    }
  }, [cartItems, product]);

  /* ── FORMATLASH ── */
  const getFullUrl = (rawPath) => {
    if (!rawPath) return null;
    let url = rawPath;
    if (typeof rawPath === "object") {
      url = rawPath.url || rawPath.image || rawPath.image_url || rawPath.src || rawPath.path;
    }
    if (typeof url !== "string") return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${BASE_URL}${cleanUrl}`;
  };

  const rawImage = product?.image || product?.image_url || product?.imageSrc || product?.img || product?.photo;
  const activeImage = getFullUrl(rawImage);

  const thumbs = product
    ? Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(img => getFullUrl(img)).filter(Boolean)
      : [activeImage, activeImage, activeImage]
    : [null, null, null];
    
  /* ── 🛠 TO'G'RILANGAN NARX VA FOIZ HISOB-KITOBI ── */
  const originalPriceNumber = Number(product?.price) || 0;
  
  // Admin paneldan kiritilgan qiymat (masalan 10 yoki 50) to'g'ridan-to'g'ri foiz deb olinadi
  const discountPercent = Number(product?.discount) || 0; 
  const hasDiscount = discountPercent > 0;

  // Yakuniy narx: Asl narxdan foiz miqdori chegiriladi
  const finalPrice = hasDiscount 
    ? originalPriceNumber - (originalPriceNumber * (discountPercent / 100)) 
    : originalPriceNumber;

  const maxStock = product?.stock !== undefined ? Math.min(50, Number(product.stock)) : 50;

  /* ── entrance animations ── */
  useEffect(() => {
    if (loading || !product) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(breadcrumbRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(galleryRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.1 });
      gsap.fromTo(infoRef.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.15 });

      if (tabSectionRef.current) {
        gsap.fromTo(tabSectionRef.current, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: tabSectionRef.current, start: "top 88%", toggleActions: "play none none none" }
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [loading, product]);

  const switchTab = (next) => {
    if (next === tab) return;
    gsap.to(tabContentRef.current, {
      opacity: 0, y: 10, duration: 0.18, ease: "power2.in",
      onComplete: () => {
        setTab(next);
        gsap.fromTo(tabContentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      },
    });
  };

  /* ── Savatga qo'shish va yangilash mantig'i ── */
  const handleAddToCartClick = async () => {
    if (maxStock === 0) return;

    const currentId = String(product.id || product._id || product.product_id);
    
    const existingItem = cartItems.find((item) => {
      const cartProdId = String(item.product?.id || item.product?._id || item.product_id || item.id);
      return cartProdId === currentId;
    });

    if (existingItem) {
      const cartItemId = existingItem.id || existingItem._id;
      await updateQuantity(cartItemId, qty);
      (`Savatdagi mahsulot miqdori ${qty} taga yangilandi!`);
    } else {
      const cartProduct = {
        id: currentId,
        name: product.name,
        price: Number(finalPrice.toFixed(2)),
        image: activeImage,
        image_url: activeImage,
        stock: product.stock,
        discount: discountPercent, // To'g'ri foiz yuborilyapti
      };
      await addToCart(cartProduct, qty);
      (`${qty} ta mahsulot savatga qo'shildi!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-2xl font-bold text-[#1a1a2e]">Product not found</p>
        <button onClick={() => navigate("/products")} className="bg-[#1a1a2e] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2d2d4e]">
          Back to Products
        </button>
      </div>
    );
  }

  const isAlreadyInCart = cartItems.some((item) => {
    const cartProdId = String(item.product?.id || item.product?._id || item.product_id || item.id);
    return cartProdId === String(product.id || product._id || product.product_id);
  });

  return (
    <div ref={pageRef} className="bg-white min-h-screen font-oxygen select-none">
      <div className="w-full container mx-auto bg-white px-5 sm:px-6 pt-14 sm:pt-20 lg:pt-25 2xl:px-27">

        {/* Breadcrumb */}
        <nav ref={breadcrumbRef} className="flex items-center gap-1.5 mb-6 sm:mb-8">
          <button onClick={() => navigate("/products")} className="text-xs sm:text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">
            Product Listing
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-xs sm:text-sm text-[#1a1a2e] font-medium truncate max-w-45">
            {product.name}
          </span>
        </nav>

        {/* Hero Area */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-14 2xl:gap-16 mb-10 lg:mb-14">

          {/* Gallery */}
          <div ref={galleryRef} className="flex gap-3 sm:gap-6 shrink-0 w-full lg:w-auto">
            <div className="flex flex-col gap-2 sm:gap-4">
              {thumbs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedThumb(i)}
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gray-50 border-2 transition-all overflow-hidden flex items-center justify-center ${selectedThumb === i ? "border-[#1a1a2e]" : "border-gray-200"
                    }`}
                >
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </button>
              ))}
            </div>

            {/* Katta Rasm oynasi va yangilangan foiz badge'i */}
            <div className="relative flex-1 min-w-0 h-64 sm:h-80 lg:w-85 xl:w-95 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
              {thumbs[selectedThumb] ? (
                <img
                  src={thumbs[selectedThumb]}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x600/f3f4f6/a3a3a3?text=Rasm+Topilmadi";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image Available</div>
              )}
              {/* Xavfsiz va aniq foiz vizualizatsiyasi */}
              {hasDiscount && discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div ref={infoRef} className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a1a2e]">{product.name}</h1>
              <button onClick={() => setWishlist((v) => !v)} className="hover:scale-110 transition-transform">
                <HeartIcon active={wishlist} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-baseline gap-2">
                {hasDiscount && (
                  <span className="text-base text-gray-400 line-through">${originalPriceNumber.toFixed(2)}</span>
                )}
                <span className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">${finalPrice.toFixed(2)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1.5">
                <Stars count={5} size={13} />
                <span className="text-xs text-gray-500">( 32 review )</span>
              </div>
            </div>

            <div className="border-t border-gray-100" />
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

            {/* Stepper */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden self-start bg-white">
                <button 
                  onClick={() => setQty((q) => Math.max(1, q - 1))} 
                  disabled={maxStock === 0}
                  className="px-4 py-2 text-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-30"
                >
                  −
                </button>
                
                <span className="px-4 text-sm font-semibold text-[#1a1a2e] min-w-8 text-center">
                  {maxStock === 0 ? 0 : qty}
                </span>
                
                <button 
                  onClick={() => setQty((q) => (q < maxStock ? q + 1 : q))} 
                  disabled={qty >= maxStock || maxStock === 0}
                  className={`px-4 py-2 text-lg font-medium transition-colors ${
                    qty >= maxStock || maxStock === 0 ? "text-gray-300 cursor-not-allowed bg-gray-50" : "hover:bg-gray-50"
                  }`}
                >
                  +
                </button>
              </div>

              {/* Savatga qo'shish / Yangilash tugmasi */}
              <button 
                onClick={handleAddToCartClick} 
                disabled={maxStock === 0}
                className={`flex-1 text-white text-sm font-semibold py-3 px-6 rounded-xl active:scale-[0.99] transition-all ${
                  maxStock === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#1a1a2e] hover:bg-[#2d2d4e]"
                }`}
              >
                {maxStock === 0 ? "Out of Stock" : isAlreadyInCart ? "Update Cart Quantity" : "Add to Cart"}
              </button>
            </div>

            {/* Extra Info */}
            <div className="flex flex-col gap-2 mt-2 border-t border-gray-50 pt-3">
              <div className="flex items-center gap-2.5">
                <TruckIcon />
                <span className="text-xs text-gray-600">Free worldwide shipping on all orders over <strong>$100</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <ClockIcon />
                <span className="text-xs text-gray-600">Delivers in: 3-7 Working Days</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full bg-[#F8F8F8] border-t border-gray-200 mt-10">
        <div className="w-full container mx-auto px-5 sm:px-6 py-10 lg:py-14 2xl:px-27">
          <div ref={tabSectionRef}>
            <div className="flex items-center gap-6 mb-6">
              {["description", "reviews"].map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`relative text-sm sm:text-base font-bold pb-2 capitalize transition-colors ${tab === t ? "text-[#1a1a2e]" : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {t}
                  {tab === t && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a2e] rounded-full" />}
                </button>
              ))}
            </div>

            <div ref={tabContentRef} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              {tab === "description" && (
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              )}
              {tab === "reviews" && (
                <div className="flex flex-col gap-4">
                  {(product.reviews ?? MOCK_REVIEWS).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  <ReviewForm />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}