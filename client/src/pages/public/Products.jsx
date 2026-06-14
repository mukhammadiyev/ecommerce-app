import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import ProductCard from "../../components/product/ProductCard.jsx";
import { getProducts } from "../../services/productService.js";

gsap.registerPlugin(ScrollTrigger);

const categories = ["Lorem ipsum (3)", "Lorem ipsum (3)", "Lorem ipsum (3)", "Lorem ipsum (3)"];

function ChevronDown({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SidebarPanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-0.75 h-5 bg-[#1a1a2e] rounded-full inline-block" />
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
  const [openCats, setOpenCats] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageRef = useRef(null);
  const headingRef = useRef(null);
  const searchRef = useRef(null);
  const sidebarRef = useRef(null);
  const gridRef = useRef(null);

  // 🔥 HAMMA NARSANI BITTA EFFECT ICHIGA OLDIK - TOBE'LIK MASSIVI BUTUNLAY BO'SH []
  useEffect(() => {
    let isMounted = true;

    // 1. Ma'lumotni yuklash
    getProducts()
      .then((res) => {
        if (!isMounted) return;
        const actualData = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        setProducts(actualData);
      })
      .catch((err) => {
        console.error("Xatolik:", err);
        // Xato bo'lsa ham products bo'sh qoladi
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);

        // 2. Animatsiyani faqat so'rov TUGAGANDAN KEYIN shu yerning o'zida ishga tushiramiz!
        setTimeout(() => {
          if (!isMounted) return;
          
          gsap.context(() => {
            gsap.fromTo([headingRef.current, searchRef.current],
              { opacity: 0, y: -18 },
              { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out" }
            );
            
            gsap.fromTo(sidebarRef.current,
              { opacity: 0, x: -24 },
              { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
            );

            if (gridRef.current) {
              gsap.fromTo(gridRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
              );
            }
          }, pageRef);
        }, 50); // Yengil kechikish DOM render bo'lishga ulgurishi uchun
      });

    return () => {
      isMounted = false;
    };
  }, []); // 👈 Butunlay bo'sh! Bu sahifa ochilganda faqat va faqat 1 marta ishlaydi.

  const productList = Array.isArray(products) ? products : [];
  const filtered = productList.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <section ref={pageRef} className="bg-white min-h-screen">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8 xl:px-20 py-8">
        <div className="flex gap-6 items-start">
          <aside ref={sidebarRef} className={`w-56 flex flex-col gap-4 ${sidebarOpen ? "block" : "hidden"} lg:flex`}>
            <SidebarPanel title="Categories">
              <ul className="flex flex-col divide-y divide-gray-100">
                {categories.map((cat, i) => (
                  <li key={i}>
                    <button onClick={() => setOpenCats((p) => ({ ...p, [i]: !p[i] }))} className="w-full flex items-center justify-between py-2.5 text-sm text-gray-700">
                      <span>{cat}</span>
                      <ChevronDown className={`transition-transform ${openCats[i] ? "rotate-180" : ""}`} />
                    </button>
                  </li>
                ))}
              </ul>
            </SidebarPanel>
          </aside>

          <div className="flex-1">
            <h1 ref={headingRef} className="text-2xl font-bold text-[#1a1a2e] mb-5">Our Collection Of Products</h1>
            <div ref={searchRef} className="relative mb-5">
              <input type="text" placeholder="Search An Item" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-4 pr-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800" />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <div key={product.id || product._id}>
                    <ProductCard
                      id={product.id || product._id}
                      name={product.name}
                      price={product.price}
                      image={product.image_url || product.image}
                      discount={product.discount || 0}
                      href={`/products/${product.id}`}
                      stock={product.stock} 
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