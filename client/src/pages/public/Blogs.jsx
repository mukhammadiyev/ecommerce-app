import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import BlogCard from "../../components/blog/BlogCard.jsx";
import api from "../../services/api.js"; // 🌟 O'zingizning sozlangan api faylingiz

gsap.registerPlugin(ScrollTrigger, SplitText);

// 🌐 Backend port manzili (Rasmlar yo'lini to'g'ri ko'rsatish uchun)
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const titleRef = useRef(null);
  const featuredImgRef = useRef(null);
  const featuredTextRef = useRef(null);
  const gridRef = useRef(null);

  // 1. Backenddan bloglarni yuklab olish qismi
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get("/blogs");
        const blogsData = response.data?.data || response.data;
        
        if (Array.isArray(blogsData)) {
          // Birinchi elementni avtomatik ravishda 'featured' (Asosiy) deb belgilaymiz
          const formattedBlogs = blogsData.map((blog, index) => ({
            ...blog,
            featured: index === 0, // birinchi element asosiy bannerga chiqadi
          }));
          setBlogs(formattedBlogs);
        }
      } catch (error) {
        console.error("Bloglarni frontendga yuklashda xato:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Ma'lumotlarni ajratib olish
  const featured = blogs.find((b) => b.featured);
  const rest = blogs.filter((b) => !b.featured);

  // 2. GSAP Animatsiyalar qismi (Faqat yuklanish tugagandan keyin ishlaydi)
  useLayoutEffect(() => {
    if (loading || blogs.length === 0) return; // Ma'lumot kelguncha kutadi

    const ctx = gsap.context(() => {
      // ── Page title animation ──
      if (titleRef.current) {
        const split = new SplitText(titleRef.current, { type: "words" });
        gsap.from(split.words, {
          y: 24,
          opacity: 0,
          stagger: 0.07,
          duration: 0.55,
          ease: "power2.out",
          onComplete: () => split.revert(),
        });
      }

      // ── Featured image animation ──
      if (featuredImgRef.current) {
        gsap.from(featuredImgRef.current, {
          x: -50,
          opacity: 0,
          duration: 0.7,
          delay: 0.2,
          ease: "power3.out",
        });
      }

      // ── Featured text animation ──
      if (featuredTextRef.current) {
        gsap.from([...featuredTextRef.current.children], {
          x: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.55,
          delay: 0.35,
          ease: "power2.out",
        });
      }

      // ── Grid cards scroll animation ──
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(":scope > *");
        if (cards.length) {
          gsap.from(cards, {
            y: 40,
            opacity: 0,
            scale: 0.95,
            stagger: 0.12,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              once: true,
            },
          });
        }
      }
    });

    return () => ctx.revert();
  }, [loading, blogs]); // loading o'zgarganda animatsiya boshlanadi

  // Rasmlar URL manzilini tekshiruvchi yordamchi funksiya
  const getImgUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${BASE_URL}/${url.replace(/\\/g, '/')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 font-oxygen">Bloglar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-10 sm:py-14 flex flex-col gap-10 font-oxygen">
        {/* Page title */}
        <h1
          ref={titleRef}
          className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]"
        >
          Our Featured Posts
        </h1>

        {/* Featured post — horizontal */}
        {featured && (
          <a
            href={`/blogs/${featured.id}`}
            className="group flex flex-col md:flex-row gap-6 md:gap-10 cursor-pointer"
          >
            {/* Image */}
            <div
              ref={featuredImgRef}
              className="w-full md:w-[46%] shrink-0 h-52 sm:h-64 md:h-72 rounded-2xl overflow-hidden bg-gray-100"
            >
              <img
                src={getImgUrl(featured.image_url)}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Text */}
            <div
              ref={featuredTextRef}
              className="flex flex-col justify-center gap-4"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug group-hover:underline">
                {featured.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-5">
                {featured.content}
              </p>
              
              {/* Author & Date */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border">
                  <img
                    src={getImgUrl(featured.author_image) || "https://via.placeholder.com/150"}
                    alt={featured.author_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-700">
                  {featured.author_name || "Noma'lum muallif"}
                </span>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-sm text-gray-500">
                  {new Date(featured.createdAt || featured.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>
          </a>
        )}

        {/* Grid cards */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rest.map((blog) => (
            <BlogCard
              key={blog.id}
              imageSrc={getImgUrl(blog.image_url)}
              authorAvatar={getImgUrl(blog.author_image) || "https://via.placeholder.com/150"}
              authorName={blog.author_name || "Noma'lum muallif"}
              date={new Date(blog.createdAt || blog.created_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
              title={blog.title}
              href={`/blogs/${blog.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}