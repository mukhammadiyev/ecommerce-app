import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService.js";

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

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
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
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 },
        "-=0.3",
      );
  }, []);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords don't match.";
    if (!form.agreed) e.agreed = "You must agree to the terms.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      /* shake */
      gsap.fromTo(
        cardRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
      );
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
      });
      navigate("/login");
    } catch {
      setErrors({ submit: "Could not create account. Please try again." });
      gsap.fromTo(
        cardRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
      );
    } finally {
      setLoading(false);
    }
  };

  const field = (key, value) => setForm((p) => ({ ...p, [key]: value }));

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
              Signup
            </h1>
            <p className="text-sm text-gray-500">
              Already Have An Account,{" "}
              <Link
                to="/login"
                className="text-[#1a1a2e] underline underline-offset-2 hover:opacity-70 transition-opacity font-medium"
              >
                Login.
              </Link>
            </p>
          </div>

          {/* global error */}
          {errors.submit && (
            <div className="anim-item mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* full name + email row */}
            <div className="anim-item grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1a2e] font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="michael.joe"
                  value={form.fullName}
                  onChange={(e) => field("fullName", e.target.value)}
                  className={`w-full border rounded-full px-5 py-3 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition-colors
                    ${errors.fullName ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#1a1a2e]"}`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 pl-2">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1a2e] font-medium">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="michael.joe@xmail.com"
                  value={form.email}
                  onChange={(e) => field("email", e.target.value)}
                  className={`w-full border rounded-full px-5 py-3 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition-colors
                    ${errors.email ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#1a1a2e]"}`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 pl-2">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* password + confirm row */}
            <div className="anim-item grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1a2e] font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••"
                    value={form.password}
                    onChange={(e) => field("password", e.target.value)}
                    className={`w-full border rounded-full px-5 py-3 pr-12 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition-colors
                      ${errors.password ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#1a1a2e]"}`}
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
                {errors.password && (
                  <p className="text-[11px] text-red-500 pl-2">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1a2e] font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••"
                    value={form.confirmPassword}
                    onChange={(e) => field("confirmPassword", e.target.value)}
                    className={`w-full border rounded-full px-5 py-3 pr-12 text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition-colors
                      ${errors.confirmPassword ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#1a1a2e]"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a2e] transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-500 pl-2">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* terms checkbox */}
            <div className="anim-item flex flex-col gap-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={(e) => field("agreed", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-4 h-4 border-2 rounded-sm transition-colors
                    peer-checked:bg-[#1a1a2e] peer-checked:border-[#1a1a2e]
                    ${errors.agreed ? "border-red-400" : "border-gray-300"}`}
                  >
                    <svg
                      className="w-full h-full text-white hidden peer-checked:block"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <polyline
                        points="2 6 5 9 10 3"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-snug">
                  I have read and agreed to the{" "}
                  <a
                    href="#"
                    className="text-[#1a1a2e] underline underline-offset-2 hover:opacity-70"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#1a1a2e] underline underline-offset-2 hover:opacity-70"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreed && (
                <p className="text-[11px] text-red-500 pl-7">{errors.agreed}</p>
              )}
            </div>

            {/* submit */}
            <div className="anim-item">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a2e] text-white font-semibold py-3.5 rounded-full hover:bg-[#2d2d4e] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: image panel ── */}
        <div
          ref={imageRef}
          className="hidden sm:block w-[46%] shrink-0 bg-[#a0a0a0] min-h-115 lg:min-h-130"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
