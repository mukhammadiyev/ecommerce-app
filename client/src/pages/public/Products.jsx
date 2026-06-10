import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import ProductCard from "../../components/product/ProductCard.jsx";
import { getProducts } from "../../services/productService.js";

gsap.registerPlugin(ScrollTrigger);

/* ── sidebar data ── */
const categories = [
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
];

const priceRanges = [
  { label: "$20.00 - $50.00", checked: true },
  { label: "$20.00 - $50.00", checked: false },
  { label: "$20.00 - $50.00", checked: false },
  { label: "$20.00 - $50.00", checked: false },
];

/* ── chevron icon ── */
function ChevronDown({ className = "" }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ── search icon ── */
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ── sidebar panel ── */
function SidebarPanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-0.75 h-5 bg-[#1a1a2e] rounded-full inline-block" />
        <h2 className="text-sm sm:text-base font-semibold text-[#1a1a2e]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState({});
  const [priceChecks, setPriceChecks] = useState(
    priceRanges.map((r) => r.checked),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── refs ── */
  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const metaRef = useRef(null);
  const searchRef = useRef(null);
  const sidebarRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  /* ── GSAP animations ── */
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      /* heading + meta slide down */
      gsap.fromTo(
        [headingRef.current, metaRef.current, searchRef.current],
        { opacity: 0, y: -18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
        },
      );

      /* sidebar slide in from left */
      gsap.fromTo(
        sidebarRef.current,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.1,
        },
      );

      /* cards: scroll-triggered parallax stagger */
      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        /* entrance: staggered fade-up */
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
            delay: (i % 3) * 0.08 /* slight column offset */,
          },
        );

        /* ongoing parallax: card floats up slightly as user scrolls past */
        gsap.to(card, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.4,
          },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section ref={pageRef} className="bg-white min-h-screen">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8 xl:px-20 2xl:px-27 py-8 lg:py-12">
        {/* ── mobile filter toggle ── */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h1
            ref={headingRef}
            className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]"
          >
            Our Collection Of Products
          </h1>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="ml-4 shrink-0 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-[#1a1a2e] hover:bg-gray-50 transition-colors"
          >
            {sidebarOpen ? "Hide Filters" : "Filters"}
          </button>
        </div>

        <div className="flex gap-6 xl:gap-8 2xl:gap-10 items-start">
          {/* ── Sidebar ── */}
          <aside
            ref={sidebarRef}
            className={`
              shrink-0 w-full lg:w-52 xl:w-56 2xl:w-60
              flex flex-col gap-4
              ${sidebarOpen ? "block" : "hidden"} lg:flex
            `}
          >
            {/* Categories */}
            <SidebarPanel title="Categories">
              <ul className="flex flex-col divide-y divide-gray-100">
                {categories.map((cat, i) => (
                  <li key={i}>
                    <button
                      onClick={() =>
                        setOpenCats((prev) => ({ ...prev, [i]: !prev[i] }))
                      }
                      className="w-full flex items-center justify-between py-2.5 text-xs sm:text-sm text-gray-700 hover:text-[#1a1a2e] transition-colors"
                    >
                      <span>{cat}</span>
                      <ChevronDown
                        className={`text-gray-400 transition-transform duration-200 ${
                          openCats[i] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </SidebarPanel>

            {/* Price Range */}
            <SidebarPanel title="Price Range">
              <ul className="flex flex-col gap-2.5">
                {priceRanges.map((range, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id={`price-${i}`}
                      checked={priceChecks[i]}
                      onChange={() =>
                        setPriceChecks((prev) =>
                          prev.map((v, idx) => (idx === i ? !v : v)),
                        )
                      }
                      className="w-3.5 h-3.5 accent-[#1a1a2e] shrink-0"
                    />
                    <label
                      htmlFor={`price-${i}`}
                      className="text-xs sm:text-sm text-gray-700 cursor-pointer select-none"
                    >
                      {range.label}
                    </label>
                  </li>
                ))}
              </ul>
            </SidebarPanel>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Heading — desktop only (mobile is above) */}
            <h1
              ref={headingRef}
              className="hidden lg:block text-2xl xl:text-3xl 2xl:text-4xl font-bold text-[#1a1a2e] mb-5"
            >
              Our Collection Of Products
            </h1>

            {/* Search bar */}
            <div ref={searchRef} className="relative mb-4 sm:mb-5">
              <input
                type="text"
                placeholder="Search An Item"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 bg-[#1a1a2e] rounded-lg text-white hover:bg-[#2d2d4e] transition-colors"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
            </div>

            {/* Meta */}
            <div ref={metaRef} className="mb-5 sm:mb-6">
              <p className="text-xs sm:text-sm font-semibold text-[#1a1a2e]">
                Showing 1–{Math.min(12, filtered.length)} of {filtered.length}{" "}
                item(s)
              </p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            {/* Product grid */}
            {loading ? (
              /* skeleton */
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 animate-pulse">
                    <div className="w-full h-44 sm:h-56 lg:h-72 rounded-2xl bg-gray-200" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-500 mt-8">
                No products found matching "{search}".
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-x-6 lg:gap-y-10 xl:gap-x-7 xl:gap-y-12">
                {filtered.map((product, i) => (
                  <div
                    key={product.id}
                    ref={(el) => (cardRefs.current[i] = el)}
                  >
                    <ProductCard
                      id={product.id}
                      image={product.imageSrc}
                      name={product.name}
                      price={product.price}
                      discount={product.discount}
                      href={product.href}
                      onAddToCart={() =>
                        console.log("Add to cart:", product.id)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
