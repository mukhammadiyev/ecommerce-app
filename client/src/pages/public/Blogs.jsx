import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLayoutEffect, useRef } from "react";
import BlogCard from "../../components/blog/BlogCard.jsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

const blogs = [
  {
    id: 1,
    imageSrc: "",
    authorAvatar: "",
    authorName: "Oliver Bennett",
    date: "18 Jan 2022",
    title: "Lorem Ipsum Is a Dummy Text Used As The Heading Of a Blog",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam.",
    href: "#",
    featured: true,
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
  {
    id: 4,
    imageSrc: "",
    authorAvatar: "",
    authorName: "Oliver Bennett",
    date: "18 Jan 2022",
    title: "Lorem Ipsum Is a Dummy Text Used As The Heading Of a Blog",
    href: "#",
  },
];

const featured = blogs.find((b) => b.featured);
const rest = blogs.filter((b) => !b.featured);

export default function Blogs() {
  const titleRef = useRef(null);
  const featuredImgRef = useRef(null);
  const featuredTextRef = useRef(null);
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // ── 1. Page title — SplitText words fan up on load ─────────────────
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

      // ── 2. Featured image — clip + slide in from left ──────────────────
      if (featuredImgRef.current) {
        gsap.from(featuredImgRef.current, {
          x: -50,
          opacity: 0,
          duration: 0.7,
          delay: 0.2,
          ease: "power3.out",
        });
      }

      // ── 3. Featured text children — stagger slide from right ───────────
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

      // ── 4. Grid cards — scroll-triggered scale + fade stagger ──────────
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
  }, []);

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
            href={featured.href}
            className="group flex flex-col md:flex-row gap-6 md:gap-10 cursor-pointer"
          >
            {/* Image */}
            <div
              ref={featuredImgRef}
              className="w-full md:w-[46%] shrink-0 h-52 sm:h-64 md:h-72 rounded-2xl overflow-hidden bg-[#9e9e9e]"
            >
              {featured.imageSrc && (
                <img
                  src={featured.imageSrc}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Text */}
            <div
              ref={featuredTextRef}
              className="flex flex-col justify-center gap-4"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug group-hover:underline">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-5">
                  {featured.excerpt}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-[#9e9e9e] overflow-hidden shrink-0">
                  {featured.authorAvatar && (
                    <img
                      src={featured.authorAvatar}
                      alt={featured.authorName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="text-sm text-gray-700">
                  {featured.authorName}
                </span>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-sm text-gray-500">{featured.date}</span>
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
              imageSrc={blog.imageSrc}
              authorAvatar={blog.authorAvatar}
              authorName={blog.authorName}
              date={blog.date}
              title={blog.title}
              href={blog.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
