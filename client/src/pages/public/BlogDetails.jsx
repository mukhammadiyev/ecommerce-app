import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

// ── API ───────────────────────────────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const json = await res.json();
  return json.data || json; // Backend ApiResponse.send mantiqiga moslashuv
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function readingTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Skeleton ──────────────────────────────────────────────────────────
function BlogDetailsSkeleton() {
  return (
    <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-14 sm:py-8 lg:py-14 2xl:py-12 animate-pulse">
      <div className="h-4 w-16 mb-6 bg-gray-200 rounded-full" />
      <div className="w-full h-52 sm:h-64 lg:h-72 xl:h-80 2xl:h-100 bg-gray-200 rounded-2xl mb-6" />
      <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-4" />
      <div className="h-4 w-1/2 bg-gray-200 rounded-lg mb-6" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-11/12" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Entrance refs
  const backRef = useRef(null);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const metaRef = useRef(null);
  const divRef = useRef(null);
  const galleryRef = useRef(null);
  
  // Paragraflar uchun dinamik array ref
  const paragraphRefs = useRef([]);
  paragraphRefs.current = [];

  const addToParagraphRefs = (el) => {
    if (el && !paragraphRefs.current.includes(el)) {
      paragraphRefs.current.push(el);
    }
  };

  // Fetch data
  useEffect(() => {
    setLoading(true);
    apiFetch(`/blogs/${id}`)
      .then(setBlog)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // GSAP entrance animation
  useEffect(() => {
    if (!blog) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Tepadagi bloklar ketma-ket ochiladi
    tl.fromTo(backRef.current, { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 })
      .fromTo(heroRef.current, { y: 30, opacity: 0, scale: 1.01 }, { y: 0, opacity: 1, scale: 1, duration: 0.6 }, "-=0.2")
      .fromTo(titleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.35")
      .fromTo(metaRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.25")
      .fromTo(divRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, "-=0.1");

    // Matn paragraflari scroll bo'lganda chiqadi
    paragraphRefs.current.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Eng pastdagi galereya scroll bo'lganda chiqadi
    if (galleryRef.current) {
      gsap.fromTo(
        galleryRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [blog]);

  if (loading) return <BlogDetailsSkeleton />;

  if (error) {
    return (
      <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-14 sm:py-24 lg:py-36 2xl:py-14">
        <p className="text-gray-400 text-sm mb-4">Couldn't load this post.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-700 underline underline-offset-4">
          Go back
        </button>
      </div>
    );
  }

  if (!blog) return null;

  const authorName = blog.author_name || "Anonymous";
  const authorImage = blog.author_image || null;
  const dateStr = formatDate(blog.created_at);
  const mins = readingTime(blog.content);

  // ⚙️ Backend relyatsiyasidan kelgan 'blog_images'ni URL massiviga o'giramiz
  const gallery = (blog.blog_images || []).map(img => img.image_url).filter(Boolean);

  const paragraphs = (blog.content || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-14 sm:py-8 lg:py-14 2xl:py-12">
      <div className="w-full">
        {/* Back navigation */}
        <div ref={backRef} className="mb-6 opacity-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            All posts
          </button>
        </div>

        {/* 1. Tepadagi Katta Muqova Rasmi (Rasmda ko'rsatilganidek) */}
        <div
          ref={heroRef}
          className="w-full h-52 sm:h-72 lg:h-96 xl:h-105 rounded-3xl overflow-hidden bg-gray-200 opacity-0 shadow-sm mb-8"
        >
          {blog.image_url ? (
            <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        {/* 2. Sarlavha (Heading) */}
        <h1
          ref={titleRef}
          className="text-[24px] sm:text-[28px] lg:text-[34px] font-bold text-gray-900 leading-tight tracking-tight opacity-0"
        >
          {blog.title}
        </h1>

        {/* 3. Muallif va Sanalar paneli */}
        <div ref={metaRef} className="mt-4 flex items-center gap-2 flex-wrap opacity-0">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
            {authorImage ? (
              <img src={authorImage} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={11} className="text-gray-400" />
              </div>
            )}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            <strong className="text-gray-900 font-medium">{authorName}</strong>
          </span>
          <span className="text-gray-300 text-sm">•</span>
          <span className="text-xs sm:text-sm text-gray-500">{dateStr}</span>
        </div>

        {/* Ajratuvchi chiziq (Divider) */}
        <div ref={divRef} className="mt-6 h-px bg-gray-100 scale-x-0 origin-left" />

        {/* 4. Maqola Matnlari (Paragraflar) */}
        <div className="mt-6 space-y-5">
          {paragraphs.map((p, i) => {
            const isHeading = p.length < 90 && !/[.,;:!?]$/.test(p) && i > 0;
            return isHeading ? (
              <h2
                key={i}
                ref={addToParagraphRefs}
                className="text-[16px] sm:text-[18px] font-bold text-gray-900 pt-4 pb-1 opacity-0"
              >
                {p}
              </h2>
            ) : (
              <p
                key={i}
                ref={addToParagraphRefs}
                className="text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.8] text-gray-600 font-normal opacity-0 align-justify"
              >
                {p}
              </p>
            );
          })}
        </div>

        {/* 5. Pastdagi Galereya: Rasmda ko'rsatilgandek 2 ta kichik rasm yonma-yon */}
        {gallery.length > 0 && (
          <div ref={galleryRef} className="mt-8 opacity-0">
            <div className="grid grid-cols-2 gap-4">
              {/* Maksimal dastlabki 2 ta rasmni chiroyli grid ko'rinishida chiqaramiz */}
              {gallery.slice(0, 2).map((src, i) => (
                <div
                  key={i}
                  className="h-36 sm:h-52 lg:h-64 xl:h-72 rounded-[20px] overflow-hidden bg-gray-200 shadow-sm"
                >
                  <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer back button */}
        <div className="mt-14 pt-6 border-t border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            Back to all posts
          </button>
        </div>
      </div>
    </div>
  );
}