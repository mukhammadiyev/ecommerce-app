import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import ProductCard from "../../components/product/ProductCard.jsx";
import { getProducts } from "../../services/productService.js";

gsap.registerPlugin(ScrollTrigger);

function ChevronDown({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SidebarPanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-[#1a1a2e] rounded-full inline-block" />
        <h2 className="text-sm sm:text-base font-semibold text-[#1a1a2e]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Barcha ref'lar aniq va to'liq e'lon qilindi
  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const searchRef = useRef(null);
  const sidebarRef = useRef(null);
  const gridRef = useRef(null);

  // 1. API orqali ma'lumot yuklash va ilk kirish animatsiyalari
  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((res) => {
        if (!isMounted) return;
        const actualData = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        setProducts(actualData);
      })
      .catch((err) => {
        console.error("Xatolik:", err);
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);

        // Sahifa to'liq yuklangach, elementlar mavjudligini tekshirib animatsiya beramiz
        setTimeout(() => {
          if (!isMounted || !pageRef.current) return;
          
          gsap.context(() => {
            if (headingRef.current && searchRef.current) {
              gsap.fromTo([headingRef.current, searchRef.current],
                { opacity: 0, y: -18 },
                { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out" }
              );
            }
            
            if (sidebarRef.current) {
              gsap.fromTo(sidebarRef.current,
                { opacity: 0, x: -24 },
                { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
              );
            }
          }, pageRef);
        }, 50);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Dinamik ravishda unikal kategoriyalar ro'yxatini olish (Object xavfsizligi bilan)
  const categories = [
    "All",
    ...new Set(
      products.map((p) => {
        if (p.category && typeof p.category === "object") {
          return p.category.name; // Agar category ob'ekt bo'lsa
        }
        return p.category; // Agar string bo'lsa
      }).filter(Boolean)
    ),
  ];

  // 3. Qidiruv va Kategoriya bo'yicha filterlash mantig'i
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    
    const productCatName = p.category && typeof p.category === "object"
      ? p.category.name
      : p.category;

    const matchesCategory = selectedCategory === "All" || productCatName === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 4. Filter o'zgarganda faqat grid bolalari (kartalar) uchun silliq render animatsiyasi
  useEffect(() => {
    if (!loading && gridRef.current && gridRef.current.children.length > 0) {
      gsap.fromTo(gridRef.current.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, [search, selectedCategory, loading]);

  return (
    <section ref={pageRef} className="bg-white min-h-screen select-none">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8 xl:px-20 py-8">
        
        {/* Mobil qurilmalar uchun filterlarni ochish tugmasi */}
        <div className="lg:hidden mb-4 flex justify-end">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-[#1a1a2e] text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            {sidebarOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Sidebar - Kategoriyalar paneli */}
          <aside 
            ref={sidebarRef} 
            className={`w-full lg:w-60 flex flex-col gap-4 ${sidebarOpen ? "block" : "hidden"} lg:flex shrink-0`}
          >
            <SidebarPanel title="Categories">
              <ul className="flex flex-col gap-1">
                {categories.map((cat, i) => {
                  // Har bir kategoriyaga tegishli mahsulotlar sonini hisoblash
                  const count = cat === "All" 
                    ? products.length 
                    : products.filter(p => {
                        const name = p.category && typeof p.category === "object" ? p.category.name : p.category;
                        return name === cat;
                      }).length;

                  return (
                    <li key={i}>
                      <button 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`w-full flex items-center justify-between py-2 px-3 text-sm rounded-xl transition-all ${
                          selectedCategory === cat 
                            ? "bg-[#1a1a2e] text-white font-medium" 
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="capitalize">{cat}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${
                          selectedCategory === cat ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SidebarPanel>
          </aside>

          {/* Mahsulotlar ro'yxati va qidiruv oynasi */}
          <div className="flex-1 w-full">
            <h1 ref={headingRef} className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-4">
              Our Collection Of Products
            </h1>
            
            <div ref={searchRef} className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search An Item..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] transition-all" 
              />
            </div>

            {loading ? (
              /* Yuklanish holatidagi skeleton effekt */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              /* Mahsulotlar mavjud bo'lgandagi holat */
              <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id || product._id}>
                    <ProductCard
                      id={product.id || product._id}
                      name={product.name}
                      price={product.price}
                      image={product.image_url || product.image}
                      discount={product.discount || 0}
                      stock={product.stock} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Mahsulot topilmagandagi Empty State */
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No products found matching your criteria.</p>
                <button 
                  onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                  className="mt-3 text-xs font-semibold text-[#1a1a2e] underline hover:text-black transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}