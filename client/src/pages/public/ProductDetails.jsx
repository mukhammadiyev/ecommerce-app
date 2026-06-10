import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProducts } from "../../services/productService.js";

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
function StarIcon({ filled = true, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#1a1a2e" : "none"}
      stroke="#1a1a2e"
      strokeWidth="1.5"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HeartIcon({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={active ? "#e05" : "none"}
      stroke={active ? "#e05" : "#aaa"}
      strokeWidth="1.8"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#555"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#555"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
          <span className="text-sm font-semibold text-[#1a1a2e]">
            {review.author}
          </span>
        </div>
        <Stars count={review.rating} size={13} />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
        {review.body}
      </p>
      <div className="flex items-center gap-3 mt-3">
        <button className="text-xs text-gray-500 hover:text-[#1a1a2e] transition-colors">
          Like
        </button>
        <button className="text-xs text-gray-500 hover:text-[#1a1a2e] transition-colors">
          Reply
        </button>
        <span className="text-xs text-gray-400">{review.time}</span>
      </div>
    </div>
  );
}

function ReviewForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    body: "",
    rating: 0,
    hover: 0,
  });
  return (
    <div className="border border-gray-400 rounded-2xl p-4 sm:p-5 bg-[#D3D3D3] mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Your Name:</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="John Doe"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Your Email:
          </label>
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="person@gmail.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>
      <div className="mb-3">
        <textarea
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          placeholder="Write your review..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-gray-400 transition-colors"
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
                <StarIcon
                  filled={star <= (form.hover || form.rating)}
                  size={16}
                />
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a2e] text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#2d2d4e] transition-colors">
          Post Review
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── static mock reviews (replace with API when ready) ── */
const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Mike Johnson",
    rating: 5,
    time: "5m",
    body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Diam nisl, cras neque, lorem vel vulputate vitae aliquam. Pretium tristique nisl ut commodo fames. Porttitor sit sagittis egestas vitae metus, odio masque amet, duis. Nunc tortor elit aliquet quis in mauris.",
  },
  {
    id: 2,
    author: "Mike Johnson",
    rating: 4,
    time: "5m",
    body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Diam nisl, cras neque, lorem vel vulputate vitae aliquam. Pretium tristique nisl ut commodo fames. Porttitor sit sagittis egestas vitae metus, odio masque amet, duis. Nunc tortor elit aliquet quis in mauris.",
  },
];

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  /* ── fetch product by id ─────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    getProducts()
      .then((response) => {
        const all = response.data;
        // find the one matching our route param (id is a string from useParams)
        const found = all.find((p) => String(p.id) === String(id));
        if (found) {
          setProduct(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── build thumbnail list from product images ── */
  // productService may return imageSrc (single) or images[] (array)
  // support both gracefully
  const thumbs = product
    ? Array.isArray(product.images) && product.images.length
      ? product.images
      : [product.imageSrc, product.imageSrc, product.imageSrc]
    : [null, null, null];

  /* ── computed prices ── */
  const price = product?.price ?? 0;
  const discount = product?.discount ?? 0;
  const originalPrice = discount
    ? parseFloat((price / (1 - discount / 100)).toFixed(2))
    : null;

  /* ── entrance animations (run once product loaded) ── */
  useEffect(() => {
    if (loading || !product) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        breadcrumbRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );

      gsap.fromTo(
        galleryRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.1 },
      );

      gsap.fromTo(
        infoRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", delay: 0.15 },
      );

      gsap.fromTo(
        tabSectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: tabSectionRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
    }, pageRef);

    return () => ctx.revert();
  }, [loading, product]);

  /* ── tab switch animation ── */
  const switchTab = (next) => {
    if (next === tab) return;
    gsap.to(tabContentRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        setTab(next);
        gsap.fromTo(
          tabContentRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        );
      },
    });
  };

  /* ══════════════════════════════════════════
     LOADING / NOT FOUND STATES
  ══════════════════════════════════════════ */
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
        <p className="text-sm text-gray-500">
          The product you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="mt-2 bg-[#1a1a2e] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2d2d4e] transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════ */
  return (
    <div ref={pageRef} className="bg-white min-h-screen font-oxygen">
      {/* ── TOP SECTION ── */}
      <div className="w-full container mx-auto bg-white px-5 sm:px-6 pt-14 sm:pt-20 lg:pt-25 2xl:px-27">
        {/* breadcrumb */}
        <nav
          ref={breadcrumbRef}
          className="flex items-center gap-1.5 mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate("/products")}
            className="text-xs sm:text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors"
          >
            Product Listing
          </button>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#aaa"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-xs sm:text-sm text-[#1a1a2e] font-medium truncate max-w-45 sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* ── HERO: gallery + info ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-14 2xl:gap-16 mb-10 lg:mb-14">
          {/* Gallery */}
          <div
            ref={galleryRef}
            className="flex gap-3 sm:gap-6 shrink-0 w-full lg:w-auto"
          >
            {/* Thumbnails column */}
            <div className="flex flex-col gap-2 sm:gap-4">
              {thumbs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedThumb(i)}
                  className={`
                    w-14 h-14 sm:w-20 sm:h-20 lg:w-21.5 lg:h-21.5 xl:w-24 xl:h-24
                    rounded-xl bg-[#c0bfbf] overflow-hidden shrink-0
                    border-2 transition-colors
                    ${selectedThumb === i ? "border-[#1a1a2e]" : "border-transparent"}
                  `}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            {/* Main image */}
            <div
              className="relative flex-1 min-w-0
              h-52 sm:h-72 lg:h-85 xl:h-95 2xl:h-105
              lg:w-75 xl:w-85 2xl:w-95
              rounded-2xl bg-[#c0bfbf] overflow-hidden"
            >
              {thumbs[selectedThumb] ? (
                <img
                  src={thumbs[selectedThumb]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : null}

              {/* discount badge on main image */}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-[#2d2d2d] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10 select-none">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div ref={infoRef} className="flex-1 min-w-0 flex flex-col gap-4">
            {/* title + wishlist */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a1a2e] leading-tight">
                {product.name}
              </h1>
              <button
                onClick={() => setWishlist((v) => !v)}
                className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                aria-label="Add to wishlist"
              >
                <HeartIcon active={wishlist} />
              </button>
            </div>

            {/* price + stars */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-baseline gap-2">
                {originalPrice && (
                  <span className="text-base text-gray-400 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
                  ${typeof price === "number" ? price.toFixed(2) : price}
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1.5">
                <Stars count={5} size={13} />
                <span className="text-xs text-gray-500">( 32 review )</span>
              </div>
            </div>

            {/* divider */}
            <div className="border-t border-gray-100" />

            {/* description text */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description ??
                "Lorem ipsum dolor sit amet, consectetuer adipi scing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magn."}
            </p>

            {/* bullet features */}
            <ul className="flex flex-col gap-1.5">
              {(
                product.features ?? [
                  "Lorem ipsum dolor sit amet, adipi scing elit",
                  "Lorem ipsum dolor sit amet, consectetuer adipi scing elit",
                  "Lorem ipsum dolor sit amet, consectetuer adipi",
                ]
              ).map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1a1a2e] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* quantity + add to cart */}
            <div className="flex flex-col sm:flex-row gap-3 mt-1">
              {/* qty stepper */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden self-start sm:self-auto">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 sm:px-4 py-2.5 text-[#1a1a2e] hover:bg-gray-50 transition-colors text-lg font-medium select-none"
                >
                  −
                </button>
                <span className="px-4 text-sm font-semibold text-[#1a1a2e] min-w-8 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 sm:px-4 py-2.5 text-[#1a1a2e] hover:bg-gray-50 transition-colors text-lg font-medium select-none"
                >
                  +
                </button>
              </div>

              {/* add to cart */}
              <button className="flex-1 bg-[#1a1a2e] text-white text-sm font-semibold py-2.5 px-6 rounded-xl hover:bg-[#2d2d4e] active:scale-[0.98] transition-all">
                Add to Cart
              </button>
            </div>

            {/* buy now */}
            <button className="w-full border border-[#1a1a2e] text-[#1a1a2e] text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all">
              Buy Now
            </button>

            {/* shipping info */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2.5">
                <TruckIcon />
                <span className="text-xs text-gray-600">
                  Free worldwide shipping on all orders over{" "}
                  <strong>$100</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ClockIcon />
                <span className="text-xs text-gray-600">
                  Delivers in: 3-7 Working Days{" "}
                  <a href="#" className="underline hover:text-[#1a1a2e]">
                    Shipping &amp; Return
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS SECTION ── */}
      <div className='w-full bg-[#F8F8F8]'>
        <div className="w-full container mx-aut px-5 sm:px-6 pb-14 sm:pb-20 lg:pb-25 2xl:px-27">
          <div
            ref={tabSectionRef}
            className="border-t border-gray-100 pt-8 lg:pt-10"
          >
            {/* tab bar */}
            <div className="flex items-center gap-0 mb-6 sm:mb-8">
              {["description", "reviews"].map((t, i) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`
                    relative text-sm sm:text-base font-semibold px-1 pb-2
                    transition-colors capitalize
                    ${tab === t ? "text-[#1a1a2e]" : "text-gray-400 hover:text-gray-600"}
                    ${
                      i > 0
                        ? "ml-6 pl-6 before:absolute before:left-0 before:top-1/2 before:translate-y-[-60%] before:h-4 before:w-px before:bg-gray-300"
                        : ""
                    }
                  `}
                >
                  {t === "description" ? "Description" : "Reviews"}
                  {tab === t && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a2e] rounded-full" />
                  )}
                </button>
              ))}
            </div>
            {/* tab content */}
            <div ref={tabContentRef}>
              {tab === "description" && (
                <div className="flex flex-col gap-4 w-full">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {product.description ??
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {(
                      product.features ?? [
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                      ]
                    ).map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed"
                      >
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#1a1a2e] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tab === "reviews" && (
                <div className="flex flex-col gap-4 w-full">
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
