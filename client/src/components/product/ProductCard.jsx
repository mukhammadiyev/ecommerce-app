import { gsap } from "gsap";
import { useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../hooks/useCartStore";

export default function ProductCard({
  id,
  image,
  name,
  discount,
  href,
  price,
  stock,
}) {
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return; // 🛡 Crashga qarshi himoya

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateY: x * 6,
      rotateX: -y * 6,
      transformPerspective: 800,
      ease: "power2.out",
      duration: 0.4,
    });

    if (imgRef.current) {
      gsap.to(imgRef.current, {
        x: x * -12,
        y: y * -8,
        ease: "power2.out",
        duration: 0.5,
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotateY: 0,
        rotateX: 0,
        ease: "elastic.out(1, 0.5)",
        duration: 0.8,
      });
    }
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        x: 0,
        y: 0,
        ease: "power2.out",
        duration: 0.5,
      });
    }
  };

  // Narx va chegirma hisob-kitoblari (Sizning asl matematikangiz saqlandi)
  const originalPriceNumber = Number(price) || 0;
  const discountPercent = Number(discount) || 0;
  const hasDiscount = discountPercent > 0;

  const finalPrice = hasDiscount
    ? originalPriceNumber * (1 - discountPercent / 100)
    : originalPriceNumber;

  const handleAddToCart = (e) => {
    e.stopPropagation();

    // Tugma bosilgandagi animatsiya
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.8 },
      { scale: 1, ease: "back.out(2)", duration: 0.35 },
    );

    const safeStock = stock !== undefined ? Number(stock) : 10;

    const cartProduct = {
      id: id,
      name: name,
      price: Number(finalPrice.toFixed(2)), // 🪙 Matematik xatolar oldini olish uchun raqam tipiga o'tkazildi
      image: image,
      image_url: image,
      stock: safeStock,
      discount: discountPercent
    };

    addToCart(cartProduct);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/products/${id}`)}
      className="product-card w-full flex flex-col gap-2 sm:gap-3 cursor-pointer select-none"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Image container */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-2xl bg-[#9e9e9e] overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#2d2d2d] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10 select-none">
            -{discountPercent}%
          </span>
        )}
        {image ? (
          <img
            ref={imgRef}
            src={image}
            alt={name}
            className="w-full h-full object-cover scale-105"
            loading="lazy" // 🚀 Sahifa tezligini oshirish uchun
          />
        ) : (
          <div ref={imgRef} className="w-full h-full bg-[#9e9e9e] scale-105" />
        )}
      </div>

      {/* Info row */}
      <div className="flex flex-col gap-1 px-0.5">
        <h3 className="text-sm sm:text-sm lg:text-base font-medium text-[#1a1a2e] truncate">
          {name}
        </h3>

        <span className="text-xs text-gray-400">Qoldiq: {stock !== undefined ? stock : 0} ta</span>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ${originalPriceNumber.toFixed(2)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-bold text-[#1a1a2e]">
              ${finalPrice.toFixed(2)}
            </span>
          </div>

          <button
          aria-label='add to cart'
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
            className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-[#1a1a2e] hover:text-white hover:border-[#1a1a2e] transition-colors shrink-0"
          >
            <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}