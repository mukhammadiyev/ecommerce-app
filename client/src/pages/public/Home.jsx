import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import BlogCard from "../../components/blog/BlogCard.jsx";
import ProductCard from "../../components/product/ProductCard.jsx";
import api from "../../services/api.js"; // 🌟 Bloglarni yuklash uchun axios instansiyasi
import { getProducts } from "../../services/productService.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

// 🌐 Backend port manzili (Rasmlar yo'lini to'g'irlash uchun)
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

const faqs = [
  {
    id: 1,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea",
  },
  {
    id: 2,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
  },
  {
    id: 3,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
  },
  {
    id: 4,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
  },
];

function parseStat(valueStr) {
  const match = String(valueStr).match(/^([\d.]+)(.*)$/);
  if (!match) return { numeric: 0, suffix: valueStr };
  return { numeric: parseFloat(match[1]), suffix: match[2] };
}

export default function Home({
  topLeftImage = "",
  bottomLeftImage = "",
  rightImage = "",
  stats = [
    {
      value: "99%",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    },
    {
      value: "100%",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    },
  ],
}) {
  const [products, setProducts] = useState([]);
  const [homeBlogs, setHomeBlogs] = useState([]); // 🌟 Statik massiv o'rniga dinamik state
  const [openId, setOpenId] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // ── refs ──────────────────────────────────────────────────────────────────
  const heroHeadingRef = useRef(null);
  const heroSubRef = useRef(null);
  const collageRef = useRef(null);
  const rightImgRef = useRef(null);
  const leftImgsRef = useRef(null);
  const statsSectionRef = useRef(null);
  const statEls = useRef([]);
  const blogCardsRef = useRef(null);
  const productCardsRef = useRef(null);

  // ── data fetch (Products & Blogs) ─────────────────────────────────────────

  useEffect(() => {
    // 1. Mahsulotlarni backenddan yuklash
    getProducts()
      .then((response) => {
        const actualData = response?.data?.data || response?.data?.products || response?.data;
        if (Array.isArray(actualData)) {
          setProducts(actualData.slice(0, 4)); // Faqat dastlabki 4 tasini chiqaramiz
        } else {
          setProducts([]);
        }
      })
      .catch((error) => {
        console.error("Bosh sahifada mahsulotlarni yuklashda xatolik:", error);
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));

    // 2. Bloglarni backenddan yuklash 🚀
    api.get("/blogs")
      .then((response) => {
        const blogsData = response.data?.data || response.data;
        if (Array.isArray(blogsData)) {
          setHomeBlogs(blogsData.slice(0, 3)); // Bosh sahifaga oxirgi 3 ta blogni kesib olamiz
        } else {
          setHomeBlogs([]);
        }
      })
      .catch((error) => {
        console.error("Bosh sahifada bloglarni yuklashda xatolik:", error);
        setHomeBlogs([]);
      })
      .finally(() => setLoadingBlogs(false));
  }, []);

  // ── helpers ───────────────────────────────────────────────────────────────
  const getImgUrl = (url) => {
    if (!url) return "";
    // Agar bazada allaqachon to'liq link (http...) bo'lsa o'zini qaytaradi
    if (url.startsWith("http")) return url;

    // Boshidagi ortiqcha slasheslarni to'g'rilab, toza yo'l ochamiz
    const cleanUrl = url.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${BASE_URL}/${cleanUrl}`;
  };

  // ── animations ────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero heading SplitText
      if (heroHeadingRef.current) {
        const split = new SplitText(heroHeadingRef.current, { type: "words" });
        gsap.from(split.words, {
          y: 30,
          opacity: 0,
          stagger: 0.05,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => split.revert(),
        });
      }

      if (heroSubRef.current) {
        gsap.from(heroSubRef.current, {
          y: 16,
          opacity: 0,
          duration: 0.6,
          delay: 0.45,
          ease: "power2.out",
        });
      }

      // Collage Parallax
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          if (rightImgRef.current && collageRef.current) {
            gsap.to(rightImgRef.current, {
              yPercent: -15,
              ease: "none",
              scrollTrigger: {
                trigger: collageRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            });

            if (leftImgsRef.current) {
              gsap.to(leftImgsRef.current, {
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                  trigger: collageRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.4,
                },
              });
            }
          }
        },
      });

      // Stats counter
      if (statsSectionRef.current && statEls.current.length > 0) {
        statEls.current.forEach(({ numEl, parsed }) => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: parsed.numeric,
            duration: 1.4,
            ease: "power1.out",
            onUpdate() {
              const display = Number.isInteger(parsed.numeric)
                ? Math.round(obj.val)
                : obj.val.toFixed(1);
              numEl.textContent = display + parsed.suffix;
            },
            scrollTrigger: {
              trigger: statsSectionRef.current,
              start: "top 80%",
              once: true,
            },
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Re-trigger animations when asynchronous content loads ──
  useEffect(() => {
    if (loadingBlogs || !homeBlogs.length || !blogCardsRef.current) return;
    const ctx = gsap.context(() => {
      const cards = blogCardsRef.current.querySelectorAll(":scope > *");
      if (cards.length) {
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: blogCardsRef.current,
            start: "top 85%",
            once: true,
          },
        });
      }
    }, blogCardsRef);
    return () => ctx.revert();
  }, [loadingBlogs, homeBlogs]);

  useEffect(() => {
    if (loadingProducts || !products.length || !productCardsRef.current) return;
    const ctx = gsap.context(() => {
      const cards = productCardsRef.current.querySelectorAll(":scope > *");
      if (cards.length) {
        gsap.from(cards, {
          scale: 0.93,
          opacity: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
          transformOrigin: "bottom center",
          scrollTrigger: {
            trigger: productCardsRef.current,
            start: "top 85%",
            once: true,
          },
        });
      }
    }, productCardsRef);
    return () => ctx.revert();
  }, [loadingProducts, products]);

  return (
    <div>
      {/* ── 1. Hero / intro ── */}
      <section className="relative w-full">
        <div className="bg-white py-8 sm:py-12 px-6 text-center">
          <h2 ref={heroHeadingRef} className="text-3xl sm:text-4xl lg:text-5xl font-oxygen font-bold text-[#1a1a2e] max-w-3xl mx-auto leading-tight lg:leading-19">
            Get To Know Who We Are And What We Do - About Us
          </h2>
          <p ref={heroSubRef} className="mt-4 sm:mt-6 text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla fringilla nunc in molestie feugiat. Nunc auctor consectetur elit.
          </p>
        </div>
      </section>

      {/* ── 2. About / image collage ── */}
      <section className="w-full bg-white">
        <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-5 2xl:py-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between mb-12 sm:mb-20 lg:mb-25">
          <div className="max-w-lg flex flex-col gap-5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-black font-oxygen leading-tight">
              Learn About Us And What Sets Us Apart
            </h2>
            <p className="text-base font-oxygen text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla fringilla nunc in molestie feugiat. Nunc auctor consectetur elit.
            </p>
            <a href="/blogs" className="inline-flex items-center gap-2 self-start rounded-full bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d2d4e] transition-colors">
              Read Our Blogs <span className="text-base leading-none">›</span>
            </a>
          </div>

          <div ref={collageRef} className="hidden md:flex relative items-end gap-2">
            <div ref={leftImgsRef} className="flex flex-col gap-8 mt-8">
              <div className="w-28 h-36 lg:w-38 lg:h-45 rounded-2xl bg-[#9e9e9e] overflow-hidden">
                {topLeftImage && <img src={topLeftImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="w-28 h-36 lg:w-38 lg:h-45 rounded-2xl bg-[#8e8e8e] overflow-hidden">
                {bottomLeftImage && <img src={bottomLeftImage} alt="" className="w-full h-full object-cover" />}
              </div>
            </div>

            <div className="relative flex flex-col items-end justify-end">
              <div className="absolute -top-16 -right-4 w-full h-full rounded-2xl bg-[#e0e0e0] translate-x-3 translate-y-0" />
              <div ref={rightImgRef} className="relative w-72 h-64 lg:w-110 lg:h-84 rounded-2xl bg-[#9e9e9e] overflow-hidden">
                {rightImage && <img src={rightImage} alt="" className="w-full h-full object-cover" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Stats / USP ── */}
      <section ref={statsSectionRef} className="w-full bg-[#757575] text-white">
        <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-14 sm:py-24 lg:py-36 2xl:py-50 flex flex-col gap-12 sm:gap-20 lg:gap-37 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 flex flex-col gap-6 sm:gap-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-oxygen leading-snug lg:leading-12 max-w-120">
              Have a Look at Our Unique Selling Proportions
            </h2>
            <a href="/products" className="inline-flex items-center gap-2 self-start rounded-full bg-[#2d2d2d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors">
              See Our Products <span className="text-base leading-none">›</span>
            </a>
          </div>

          <div className="flex-1 flex flex-col gap-6 sm:gap-8">
            <p className="text-base font-oxygen text-white/90 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
            </p>
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
              {stats.map((stat, i) => {
                const parsed = parseStat(stat.value);
                return (
                  <div key={i} className="flex flex-col gap-3 sm:gap-4">
                    <p className="text-4xl sm:text-5xl font-bold font-oxygen" ref={(el) => { if (el) statEls.current[i] = { numEl: el, parsed }; }}>
                      {stat.value}
                    </p>
                    <p className="text-sm font-oxygen text-white/80 leading-relaxed max-w-55">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Blog section (Dinamik Backend) ── */}
      <section className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-14 sm:py-20 lg:py-27 flex flex-col gap-10 lg:gap-15 font-oxygen">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-10">
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Latest Ongoings</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Stay updated with our latest news, detailed stories and special articles straight from our authors.
            </p>
          </div>
          <a href="/blogs" className="inline-flex items-center gap-2 self-start rounded-full bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d2d4e] transition-colors whitespace-nowrap mt-1">
            Read All Blogs <span className="text-base leading-none">›</span>
          </a>
        </div>

        {loadingBlogs ? (
          <p className="text-center text-gray-500 py-10">Bloglar yuklanmoqda...</p>
        ) : (
          <div ref={blogCardsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                imageSrc={getImgUrl(blog.image_url)}
                authorAvatar={getImgUrl(blog.author_image) || "https://via.placeholder.com/150"}
                authorName={blog.author_name || "Noma'lum muallif"}
                date={new Date(blog.createdAt || blog.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                title={blog.title}
                href={`/blogs/${blog.id}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── FAQ Section ── */}
      <section className="w-full bg-white">
        <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-10 sm:py-16 flex flex-col gap-8 lg:flex-row lg:gap-16 font-oxygen">
          <div className="flex flex-col gap-5 lg:max-w-120 lg:shrink-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] leading-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet.
            </p>
            <a href="#" className="inline-flex items-center gap-2 self-start rounded-full bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d2d4e] transition-colors">
              Ask A Question <span className="text-base leading-none">›</span>
            </a>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenId(isOpen ? null : faq.id)} className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left text-sm font-medium text-[#1a1a2e] hover:bg-gray-50 transition-colors">
                    <span>{faq.question}</span>
                    {isOpen ? <FaChevronUp className="w-4 h-4 shrink-0 text-gray-500 ml-3" /> : <FaChevronDown className="w-4 h-4 shrink-0 text-gray-500 ml-3" />}
                  </button>
                  {isOpen && <div className="px-4 sm:px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Featured Products (Dinamik Backend) ── */}
      <section className="w-full container mx-auto bg-white px-5 sm:px-6 py-14 sm:py-20 lg:py-25 2xl:px-27">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Featured Products</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-md">
            Check out our most popular and newly arrived products curated carefully for you.
          </p>
        </div>

        {loadingProducts ? (
          <p className="text-center text-gray-500 py-10">Mahsulotlar yuklanmoqda...</p>
        ) : (
          <div ref={productCardsRef} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => {
              // 💡 Diqqat: Backend maydoningiz nomini tekshiring! 
              // Odatda yoki 'image_url', yoki 'image', yoki 'main_image' bo'ladi.
              const rawImage = product.image_url || product.image || product.main_image || product.imageSrc;
              const finalImageUrl = getImgUrl(rawImage);

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  // 🌟 Har ehtimolga qarshi ikkala props nomida ham yuboramiz:
                  imageSrc={finalImageUrl}  // Agar ProductCard 'imageSrc' kutayotgan bo'lsa
                  image_url={finalImageUrl} // Agar ProductCard 'image_url' kutayotgan bo'lsa
                  image={finalImageUrl}     // Agar ProductCard shunchaki 'image' kutayotgan bo'lsa
                  name={product.name || product.title}
                  price={product.price}
                  discount={product.discount}
                  href={`/products/${product.id}`}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}