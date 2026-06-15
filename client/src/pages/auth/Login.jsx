import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService.js";

function EyeIcon({ open }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  
  // 🛠️ State nomini backend kutayotgan 'email' kalitiga moslashtirdik
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── refs ── */
  const cardRef = useRef(null);
  const formRef = useRef(null);
  const imageRef = useRef(null);

  /* ── entrance animation ── */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 32, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 },
    )
      .fromTo(
        imageRef.current,
        { opacity: 0, x: 24 },
        { opacity: 1, x: 0, duration: 0.55 },
        "-=0.35",
      )
      .fromTo(
        formRef.current?.querySelectorAll(".anim-item"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 },
        "-=0.3",
      );
  }, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    /* shake animation on error */
    const shake = () => {
      gsap.fromTo(
        cardRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
      );
    };

    try {
      // 🌟 Xizmat faylingiz (authService) obyekt ichida 'identifier' kutyapti!
      // Shuning uchun form.email qiymatini 'identifier' kaliti bilan yuboramiz.
      const data = await login({ 
        identifier: form.email, // 👈 kalit nomi 'identifier' bo'ldi
        password: form.password 
      });
      
      // Muvaffaqiyatli kirgandan so'ng tokenni authService'ning o'zi localStorage'ga yozadi.
      // Endi faqat ro'lga qarab sahifani yo'naltiramiz:
      if (data && (data.user?.role === "admin" || data.role === "admin")) {
        // Agar admin bo'lsa, to'g'ridan-to'g'ri bloglar boshqaruviga o'tkaziladi
        window.location.href = "/admin/blogs";
      } else {
        window.location.href = "/account"; 
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Incorrect email or password. Please try again.");
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full container mx-auto bg-white px-5 sm:px-6 py-14 sm:py-20 lg:py-10 2xl:px-27 font-oxygen">
      <div
        ref={cardRef}
        className="rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row"
      >
        {/* ── Left: form panel ── */}
        <div
          ref={formRef}
          className="flex-1 px-7 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14 flex flex-col justify-center"
        >
          {/* heading */}
          <div className="anim-item mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-1.5">
              Login
            </h1>
            <p className="text-sm text-gray-500">
              Do not have an account,{" "}
              <Link
                to="/register"
                className="text-[#1a1a2e] underline underline-offset-2 hover:opacity-70 transition-opacity font-medium"
              >
                create a new one.
              </Link>
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* email / phone */}
            <div className="anim-item flex flex-col gap-1.5">
              <label className="text-sm text-[#1a1a2e] font-medium">
                Enter Your Email Or Phone
              </label>
              <input
                type="text"
                placeholder="michael.joe@xmail.com"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-full px-5 py-3 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none focus:border-[#1a1a2e] transition-colors"
                required
              />
            </div>

            {/* password */}
            <div className="anim-item flex flex-col gap-1.5">
              <label className="text-sm text-[#1a1a2e] font-medium">
                Enter Your Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-full px-5 py-3 pr-12 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none focus:border-[#1a1a2e] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a2e] transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* submit */}
            <div className="anim-item">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a2e] text-white font-semibold py-3.5 rounded-full hover:bg-[#2d2d4e] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Logging in…" : "Login"}
              </button>
            </div>

            {/* forgot password */}
            <div className="anim-item text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-[#1a1a2e] underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Forgot Your Password
              </Link>
            </div>
          </form>
        </div>

        {/* ── Right: image panel ── */}
        <div
          ref={imageRef}
          className="hidden sm:block w-[46%] shrink-0 bg-[#a0a0a0] min-h-105 lg:min-h-120"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}