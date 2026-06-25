import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import logo from "@images/footer_logo.png";
import newsletterService from "../../services/newsletterService";

gsap.registerPlugin(ScrollTrigger);

const brandLogos = [
  { name: "SheFinds", style: "font-bold tracking-widest text-xs uppercase" },
  { name: "yahoo! news", style: "font-bold text-sm" },
  { name: "healthline", style: "font-semibold text-lg tracking-tight" },
  { name: "yahoo! news", style: "font-bold text-sm" },
  { name: "yahoo!", style: "font-bold text-sm" },
  { name: "msn", style: "font-bold text-sm italic" },
  { name: "yahoo! news", style: "font-bold text-sm" },
];

const footerColumns = [
  { heading: "PRODUCTS", links: ["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"] },
  { heading: "LEGAL PAGES", links: ["Lorem Ipsum Text", "Lorem Ipsum Text", "Lorem Ipsum Text", "Lorem Ipsum", "Lorem Ipsum"] },
  { heading: "PRODUCTS", links: ["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"] },
  { heading: "PRODUCTS", links: ["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"] },
  { heading: "LEGAL PAGES", links: ["Lorem Ipsum Text", "Lorem Ipsum Text", "Lorem Ipsum Text", "Lorem Ipsum", "Lorem Ipsum"] },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ── refs for GSAP ── */
  const footerRef = useRef(null);
  const pressBannerRef = useRef(null);
  const brandLogosRef = useRef([]);
  const logoRef = useRef(null);
  const headingRef = useRef(null);
  const dynamicContainerRef = useRef(null); // 🔥 Form o'rniga umumiy konteynerni animatsiya qilamiz
  const columnsRef = useRef([]);
  const copyrightRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await newsletterService.subscribe(email);
      if (res.success || res) {
        setIsSubscribed(true);
        setEmail(""); 
        
        // 🔥 GSAP o'lchamlarini yangilash (ScrollTrigger datchiklarini qayta hisoblaydi)
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      }
    } catch (err) {
      setErrorMessage(err.message || "Obuna bo'lishda xatolik yuz berdi.");
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── 1. Press bar ── */
      gsap.fromTo(pressBannerRef.current, { opacity: 0, y: -20 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: pressBannerRef.current, start: "top 90%", toggleActions: "play none none none" }
      });

      /* ── 2. Brand logos ── */
      gsap.fromTo(brandLogosRef.current, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.07,
        scrollTrigger: { trigger: pressBannerRef.current, start: "top 85%", toggleActions: "play none none none" }
      });

      /* ── 3. Logo mark ── */
      gsap.fromTo(logoRef.current, { opacity: 0, scale: 0.8 }, {
        opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)",
        scrollTrigger: { trigger: logoRef.current, start: "top 88%", toggleActions: "play none none none" }
      });

      /* ── 4. Newsletter heading ── */
      gsap.fromTo(headingRef.current, { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.65, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 88%", toggleActions: "play none none none" }
      });

      /* ── 5. Dynamic Container Animation (Form/Success wrapper) ── */
      gsap.fromTo(dynamicContainerRef.current, { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.55, delay: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: dynamicContainerRef.current, start: "top 90%", toggleActions: "play none none none" }
      });

      /* ── 6. Footer columns ── */
      gsap.fromTo(columnsRef.current, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.08,
        scrollTrigger: { trigger: columnsRef.current[0], start: "top 88%", toggleActions: "play none none none" }
      });

      /* ── 7. Copyright ── */
      gsap.fromTo(copyrightRef.current, { opacity: 0 }, {
        opacity: 1, duration: 0.8, ease: "power1.out",
        scrollTrigger: { trigger: copyrightRef.current, start: "top 95%", toggleActions: "play none none none" }
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-[#4a4a4a] text-white">
      {/* ── Press logos bar ── */}
      <div ref={pressBannerRef} className="w-full bg-[#5a5a5a]">
        <div className="mx-auto container flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 lg:px-16 xl:px-24 py-4 lg:py-6">
          {brandLogos.map((brand, i) => (
            <span
              key={i}
              ref={(el) => (brandLogosRef.current[i] = el)}
              className={`text-white opacity-90 ${brand.style}`}
            >
              {brand.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Newsletter section ── */}
      <div className="w-full container mx-auto px-5 sm:px-8 lg:px-16 xl:px-24 py-8 sm:py-10 lg:py-16 text-center">
        {/* Logo */}
        <div ref={logoRef} className="mb-5 sm:mb-6 flex justify-center">
          <img src={logo} alt="Renew Bariatrics" className="h-10 sm:h-12 lg:h-14" />
        </div>

        <h2
          ref={headingRef}
          className="mx-auto max-w-xs sm:max-w-sm lg:max-w-md text-xl sm:text-2xl lg:text-3xl font-semibold leading-snug my-6 sm:my-8"
        >
          Subscribe To Your Newsletter To Stay Updated About Discounts
        </h2>

        {/* ── Dinamik Konteyner (GSAP endi to'g'ridan-to'g'ri shuni kuzatadi) ── */}
        <div ref={dynamicContainerRef} className="flex flex-col items-center justify-center min-h-27.5">
          {!isSubscribed ? (
            <div className="w-full flex flex-col items-center">
              <form onSubmit={handleSubmit} className="flex justify-center w-full">
                <div className="flex items-center rounded-full border border-white/40 bg-transparent overflow-hidden px-4 py-2 w-full max-w-[90%] sm:max-w-sm lg:max-w-md focus-within:border-white transition-colors">
                  <input
                    type="email"
                    placeholder="person@email.com"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none disabled:opacity-50"
                  />
                  <button
                  aria-label='submit'
                    type="submit"
                    disabled={loading}
                    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-3 h-3 border-2 border-[#4a4a4a] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>

              {errorMessage && (
                <p className="text-xs mt-3 font-medium text-red-400 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                  {errorMessage}
                </p>
              )}
            </div>
          ) : (
            /* Muvaffaqiyat kartasi */
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full max-w-[90%] sm:max-w-sm text-center shadow-2xl backdrop-blur-md transition-all duration-300">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400 mb-2 border border-green-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-0.5">Obuna muvaffaqiyatli yakunlandi!</h3>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Obunangiz tasdiqlandi. Barcha chegirmalar emailingizga yuboriladi. 📬
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer columns ── */}
      <div className="pb-10">
        <div className="mx-auto container px-5 sm:px-8 lg:px-16 xl:px-24 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {footerColumns.map((col, i) => (
            <div key={i} ref={(el) => (columnsRef.current[i] = el)}>
              <h4 className="mb-4 text-sm font-bold tracking-widest text-[#9A9A9A] uppercase">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-sm text-white hover:text-white/70 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div ref={copyrightRef} className="border-t border-white/10 px-5 sm:px-8 py-4 text-center">
        <p className="text-xs text-white/50">
          Copyright © 2023 Renew Bariatrics, Inc.
        </p>
      </div>
    </footer>
  );
}