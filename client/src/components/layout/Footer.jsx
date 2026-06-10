import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef, useState } from "react"
import logo from "../../../public/footer_logo.png"

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
  {
    heading: "PRODUCTS",
    links: ["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"],
  },
  {
    heading: "LEGAL PAGES",
    links: [
      "Lorem Ipsum Text",
      "Lorem Ipsum Text",
      "Lorem Ipsum Text",
      "Lorem Ipsum",
      "Lorem Ipsum",
    ],
  },
  {
    heading: "PRODUCTS",
    links: [
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
    ],
  },
  {
    heading: "PRODUCTS",
    links: [
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
    ],
  },
  {
    heading: "LEGAL PAGES",
    links: [
      "Lorem Ipsum Text",
      "Lorem Ipsum Text",
      "Lorem Ipsum Text",
      "Lorem Ipsum",
      "Lorem Ipsum",
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  /* ── refs for GSAP ── */
  const footerRef = useRef(null);
  const pressBannerRef = useRef(null);
  const brandLogosRef = useRef([]);
  const logoRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const columnsRef = useRef([]);
  const copyrightRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setEmail("");
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── 1. Press bar: fade + slide in from top ── */
      gsap.fromTo(
        pressBannerRef.current,
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pressBannerRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      /* ── 2. Brand logos: stagger in ── */
      gsap.fromTo(
        brandLogosRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: pressBannerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      /* ── 3. Logo mark: scale in ── */
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: logoRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      /* ── 4. Newsletter heading: slide up ── */
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      /* ── 5. Form: fade in slightly delayed ── */
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      /* ── 6. Footer columns: stagger left-to-right ── */
      gsap.fromTo(
        columnsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: columnsRef.current[0],
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      /* ── 7. Copyright: simple fade ── */
      gsap.fromTo(
        copyrightRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power1.out",
          scrollTrigger: {
            trigger: copyrightRef.current,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-[#4a4a4a] text-white">
      {/* ── Press logos bar ── */}
      <div ref={pressBannerRef} className="w-full bg-[#5a5a5a]">
        <div className="mx-auto container flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 lg:px-16 xl:px-24 2xl:px-27 py-4 lg:py-6 2xl:py-10">
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
      <div className="w-full container mx-auto px-5 sm:px-8 lg:px-16 xl:px-24 2xl:px-27 py-8 sm:py-10 lg:py-16 xl:py-20 2xl:pt-36 2xl:pb-10 text-center">
        {/* Logo */}
        <div ref={logoRef} className="mb-5 sm:mb-6 flex justify-center">
          <img src={logo} alt="Renew Bariatrics" className="h-10 sm:h-12 lg:h-14 2xl:h-auto" />
        </div>

        <h2
          ref={headingRef}
          className="mx-auto max-w-xs sm:max-w-sm lg:max-w-md text-xl sm:text-2xl lg:text-3xl 2xl:text-2xl font-semibold leading-snug my-6 sm:my-8 lg:my-10"
        >
          Subscribe To Your Newsletter To Stay Updated About Discounts
        </h2>

        {/* Email input */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-6 sm:mt-8 flex justify-center"
        >
          <div className="flex items-center rounded-full border border-white/40 bg-transparent overflow-hidden px-4 py-2 w-full max-w-[90%] sm:max-w-sm lg:max-w-md 2xl:max-w-sm">
            <input
              type="email"
              placeholder="person@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none"
            />
            <button
              type="submit"
              className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] hover:bg-white/90 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
        </form>
      </div>

      {/* ── Footer columns ── */}
      <div className="pb-10 sm:pb-12">
        <div className="mx-auto container px-5 sm:px-8 lg:px-16 xl:px-24 2xl:px-27 py-4 lg:py-8 2xl:py-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {footerColumns.map((col, i) => (
            <div key={i} ref={(el) => (columnsRef.current[i] = el)}>
              <h4 className="mb-4 lg:mb-5 text-sm lg:text-base 2xl:text-lg font-bold tracking-widest text-[#9A9A9A] uppercase">
                {col.heading}
              </h4>
              <ul className="space-y-2 lg:space-y-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href="#"
                      className="text-sm lg:text-base 2xl:text-lg text-white hover:text-white/70 transition-colors"
                    >
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
      <div
        ref={copyrightRef}
        className="border-t border-white/10 px-5 sm:px-8 py-4 text-center"
      >
        <p className="text-xs text-white/50">
          Copyright © 2023 Renew Bariatrics, Inc.
        </p>
      </div>
    </footer>
  );
}