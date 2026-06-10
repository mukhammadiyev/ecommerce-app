import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"
import BlogCard from "../../components/blog/BlogCard.jsx"
import ProductCard from "../../components/product/ProductCard.jsx"
import { getProducts } from "../../services/productService.js"

gsap.registerPlugin(ScrollTrigger, SplitText);

// ─── static data ────────────────────────────────────────────────────────────

const defaultBlogs = [
  {
    id: 1,
    imageSrc: "",
    authorAvatar: "",
    authorName: "Oliver Bennett",
    date: "18 Jan 2022",
    title: "Lorem Ipsum Is a Dummy Text Used As The Heading Of a Blog",
    href: "#",
  },
  {
    id: 2,
    imageSrc: "",
    authorAvatar: "",
    authorName: "Oliver Bennett",
    date: "18 Jan 2022",
    title: "Lorem Ipsum Is a Dummy Text Used As The Heading Of a Blog",
    href: "#",
  },
  {
    id: 3,
    imageSrc: "",
    authorAvatar: "",
    authorName: "Oliver Bennett",
    date: "18 Jan 2022",
    title: "Lorem Ipsum Is a Dummy Text Used As The Heading Of a Blog",
    href: "#",
  },
];

const faqs = [
  {
    id: 1,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea",
  },
  {
    id: 2,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
  },
  {
    id: 3,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
  },
  {
    id: 4,
    question: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed?",
    answer:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
  },
];

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Parse a stat string like "99%" → { numeric: 99, suffix: "%" }
 * Works for "100%", "4.8★", "12K+", plain numbers, etc.
 */
function parseStat(valueStr) {
  const match = String(valueStr).match(/^([\d.]+)(.*)$/);
  if (!match) return { numeric: 0, suffix: valueStr };
  return { numeric: parseFloat(match[1]), suffix: match[2] };
}

// ─── component ──────────────────────────────────────────────────────────────

export default function Home({
  topLeftImage = "",
  bottomLeftImage = "",
  rightImage = "",
  blogs = defaultBlogs,
  stats = [
    {
      value: "99%",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    },
    {
      value: "100%",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    },
  ],
}) {
  const [products, setProducts] = useState([]);
  const [openId, setOpenId] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── refs ──────────────────────────────────────────────────────────────────

  // 1. Hero SplitText
  const heroHeadingRef = useRef(null);
  const heroSubRef = useRef(null);

  // 2. About parallax
  const collageRef = useRef(null);       // wrapper (md+ only)
  const rightImgRef = useRef(null);      // tall right image
  const leftImgsRef = useRef(null);      // left column

  // 3. Stats counters
  const statsSectionRef = useRef(null);
  const statEls = useRef([]);            // array of { numEl, parsed }

  // 4. Blog cards stagger
  const blogCardsRef = useRef(null);

  // 5. Product cards stagger
  const productCardsRef = useRef(null);

  // ── data fetch ────────────────────────────────────────────────────────────

  useEffect(() => {
    getProducts()
      .then((response) => setProducts(response.data.slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  // ── animations ────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // ── 1. Hero heading — SplitText words fan up on load ────────────────
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

      // Hero subtext fades in slightly after heading
      if (heroSubRef.current) {
        gsap.from(heroSubRef.current, {
          y: 16,
          opacity: 0,
          duration: 0.6,
          delay: 0.45,
          ease: "power2.out",
        });
      }

      // ── 2. Image collage — parallax (md+ only, scrub) ───────────────────
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          if (rightImgRef.current && collageRef.current) {
            // Tall right image drifts upward as section scrolls
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

            // Left column drifts downward (opposite, slower)
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

      // ── 3. Stats counters — count up on section enter ───────────────────
      if (statsSectionRef.current && statEls.current.length > 0) {
        statEls.current.forEach(({ numEl, parsed }) => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: parsed.numeric,
            duration: 1.4,
            ease: "power1.out",
            onUpdate() {
              const display =
                Number.isInteger(parsed.numeric)
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

      // ── 4. Blog cards — staggered fade + slide up ───────────────────────
      if (blogCardsRef.current) {
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
      }

      // ── 5. Product cards — scale + fade stagger ─────────────────────────
      if (productCardsRef.current) {
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
      }
    });

    return () => ctx.revert(); // full cleanup — kills all ScrollTriggers in ctx
  }, []);

  // Re-run product card animation when products load (they weren't in DOM on first layout pass)
  useEffect(() => {
    if (!products.length || !productCardsRef.current) return;

    const ctx = gsap.context(() => {
      const cards = productCardsRef.current.querySelectorAll(":scope > *");
      if (!cards.length) return;

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
    }, productCardsRef);

    return () => ctx.revert();
  }, [products]);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── 1. Hero / intro ─────────────────────────────────────────────── */}
      <section className="relative w-full">
        <div className="bg-white py-8 sm:py-12 px-6 text-center">
          <h2
            ref={heroHeadingRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-oxygen font-bold text-[#1a1a2e] max-w-3xl mx-auto leading-tight lg:leading-19"
          >
            Get To Know Who We Are And What We Do - About Us
          </h2>
          <p
            ref={heroSubRef}
            className="mt-4 sm:mt-6 text-sm text-gray-600 max-w-xl mx-auto leading-relaxed"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            fringilla nunc in molestie feugiat. Nunc auctor consectetur elit,
            quis pulvina. Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Nulla fringilla nunc in molestie feugiat
          </p>
        </div>
      </section>

      {/* ── 2. About / image collage ────────────────────────────────────── */}
      <section className="w-full bg-white">
        <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-5 2xl:py-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between mb-12 sm:mb-20 lg:mb-25">
          {/* Left: text */}
          <div className="max-w-lg flex flex-col gap-5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-black font-oxygen leading-tight">
              Learn About Us And What Sets Us Apart
            </h2>
            <p className="text-base font-oxygen text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
              fringilla nunc in molestie feugiat. Nunc auctor consectetur elit,
              quis pulvina. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Nulla fringilla nunc in molestie feugiat. Nunc auctor
              consectetur elit, quis pulvina.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d2d4e] transition-colors"
            >
              Read Our Blogs
              <span className="text-base leading-none">›</span>
            </a>
          </div>

          {/* Right: image collage — hidden on mobile, parallax on md+ */}
          <div ref={collageRef} className="hidden md:flex relative items-end gap-2">
            {/* Left column: two stacked smaller images */}
            <div ref={leftImgsRef} className="flex flex-col gap-8 mt-8">
              <div className="w-28 h-36 lg:w-38 lg:h-45 rounded-2xl bg-[#9e9e9e] overflow-hidden">
                {topLeftImage && (
                  <img src={topLeftImage} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="w-28 h-36 lg:w-38 lg:h-45 rounded-2xl bg-[#8e8e8e] overflow-hidden">
                {bottomLeftImage && (
                  <img src={bottomLeftImage} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            {/* Right: tall image */}
            <div className="relative flex flex-col items-end justify-end">
              <div className="absolute -top-16 -right-4 w-full h-full rounded-2xl bg-[#e0e0e0] translate-x-3 translate-y-0" />
              <div
                ref={rightImgRef}
                className="relative w-72 h-64 lg:w-110 lg:h-84 rounded-2xl bg-[#9e9e9e] overflow-hidden"
              >
                {rightImage && (
                  <img src={rightImage} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Stats / USP ──────────────────────────────────────────────── */}
      <section ref={statsSectionRef} className="w-full bg-[#757575] text-white">
        <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-14 sm:py-24 lg:py-36 2xl:py-50 flex flex-col gap-12 sm:gap-20 lg:gap-37 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: title + CTA */}
          <div className="flex-1 flex flex-col gap-6 sm:gap-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-oxygen leading-snug lg:leading-12 max-w-120">
              Have a Look at Our Unique Selling Proportions
            </h2>
            <a
              href="#"
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#2d2d2d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
            >
              See Our Products
              <span className="text-base leading-none">›</span>
            </a>
          </div>

          {/* Right: description + stats */}
          <div className="flex-1 flex flex-col gap-6 sm:gap-8">
            <p className="text-base font-oxygen text-white/90 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam
              libero vitae erat.
            </p>
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
              {stats.map((stat, i) => {
                const parsed = parseStat(stat.value);
                return (
                  <div key={i} className="flex flex-col gap-3 sm:gap-4">
                    {/* Animated number — ref stored in statEls array */}
                    <p
                      className="text-4xl sm:text-5xl font-bold font-oxygen"
                      ref={(el) => {
                        if (el) statEls.current[i] = { numEl: el, parsed };
                      }}
                    >
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

      {/* ── 4. Blog section ─────────────────────────────────────────────── */}
      <section className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-14 sm:py-20 lg:py-27 flex flex-col gap-10 lg:gap-15 font-oxygen">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-10">
          <div className="flex flex-col gap-2 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
              Latest Ongoings
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
              fringilla nunc in molestie feugiat. Nunc auctor consectetur elit,
              quis pulvina.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d2d4e] transition-colors whitespace-nowrap mt-1"
          >
            Read All Blogs
            <span className="text-base leading-none">›</span>
          </a>
        </div>

        {/* Blog cards — stagger target */}
        <div
          ref={blogCardsRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              imageSrc={blog.imageSrc}
              authorAvatar={blog.authorAvatar}
              authorName={blog.authorName}
              date={blog.date}
              title={blog.title}
              href={blog.href}
            />
          ))}
        </div>
      </section>

      {/* ── FAQ (no animation — interactive) ────────────────────────────── */}
      <section className="w-full bg-white">
        <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 py-10 sm:py-16 flex flex-col gap-8 lg:flex-row lg:gap-16 font-oxygen">
          {/* Left */}
          <div className="flex flex-col gap-5 lg:max-w-120 lg:shrink-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d2d4e] transition-colors"
            >
              Ask A Question
              <span className="text-base leading-none">›</span>
            </a>
          </div>

          {/* Right: accordion */}
          <div className="flex-1 flex flex-col gap-3">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left text-sm font-medium text-[#1a1a2e] hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <FaChevronUp className="w-4 h-4 shrink-0 text-gray-500 ml-3" />
                    ) : (
                      <FaChevronDown className="w-4 h-4 shrink-0 text-gray-500 ml-3" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Featured Products ─────────────────────────────────────────── */}
      <section className="w-full container mx-auto bg-white px-5 sm:px-6 py-14 sm:py-20 lg:py-25 2xl:px-27">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
            Featured Products
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            fringilla nunc in molestie feugiat. Nunc auctor consectetur elit,
            quis pulvina.
          </p>
        </div>

        {/* Cards grid — stagger target */}
        <div
          ref={productCardsRef}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              imageSrc={product.imageSrc}
              name={product.name}
              price={product.price}
              discount={product.discount}
              href={product.href}
            />
          ))}
        </div>
      </section>
    </div>
  );
}