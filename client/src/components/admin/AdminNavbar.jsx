import { gsap } from "gsap";
import { Bell, ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "uz", label: "O'zbek", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export default function AdminNavbar({ onMenuToggle }) {
  const navRef = useRef(null);
  const bellRef = useRef(null);
  const langDropRef = useRef(null);
  const profileDropRef = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false); // mobile search overlay
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications] = useState(4);

  // Mount animation
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
    );
  }, []);

  // Bell shake
  useEffect(() => {
    const tl = gsap.timeline({ delay: 1.2 });
    tl.to(bellRef.current, { rotate: 18, duration: 0.1 })
      .to(bellRef.current, { rotate: -18, duration: 0.1 })
      .to(bellRef.current, { rotate: 10, duration: 0.1 })
      .to(bellRef.current, { rotate: 0, duration: 0.1 });
  }, []);

  // Dropdown open animations
  useEffect(() => {
    if (langOpen && langDropRef.current) {
      gsap.fromTo(
        langDropRef.current,
        { opacity: 0, y: -6, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" },
      );
    }
  }, [langOpen]);

  useEffect(() => {
    if (profileOpen && profileDropRef.current) {
      gsap.fromTo(
        profileDropRef.current,
        { opacity: 0, y: -6, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" },
      );
    }
  }, [profileOpen]);

  // Outside click closes dropdowns
  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest("[data-lang]")) setLangOpen(false);
      if (!e.target.closest("[data-profile]")) setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-20 h-16 bg-[#1a1f2e] border-b border-white/5"
    >
      {/* ── Normal bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-full px-4 gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger (mobile only) */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Search — desktop: inline input; mobile: icon that opens overlay */}
          <div className="hidden sm:flex items-center gap-2 h-9 w-48 lg:w-64 px-3 rounded-xl bg-[#252b3b] focus-within:ring-1 focus-within:ring-[#6c63ff]/60 transition-all">
            <Search size={15} className="text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-white placeholder-white/25 outline-none w-full"
            />
          </div>

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Bell */}
          <button
            ref={bellRef}
            className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell size={18} />
            {notifications > 0 && (
              <span className="absolute top-2 right-2 w-1.75 h-1.75 bg-[#ff6584] rounded-full ring-2 ring-[#1a1f2e]" />
            )}
          </button>

          {/* Language — flag only on mobile, flag+label on sm+ */}
          <div className="relative" data-lang>
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setProfileOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="text-base leading-none">{activeLang.flag}</span>
              <span className="hidden md:block text-xs font-medium text-white/60">
                {activeLang.label}
              </span>
              <ChevronDown
                size={12}
                className={`text-white/30 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
              />
            </button>

            {langOpen && (
              <div
                ref={langDropRef}
                className="absolute right-0 top-full mt-2 w-36 bg-[#252b3b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setActiveLang(lang);
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors
                      ${
                        activeLang.code === lang.code
                          ? "bg-[#6c63ff]/20 text-white"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Profile */}
          <div className="relative" data-profile>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setLangOpen(false);
              }}
              className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-white text-sm font-bold">
                  M
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#1a1f2e]" />
              </div>
              {/* Name — hidden on mobile */}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  Moni Roy
                </p>
                <p className="text-[10px] text-white/35 leading-tight">Admin</p>
              </div>
              <ChevronDown
                size={12}
                className={`text-white/30 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div
                ref={profileDropRef}
                className="absolute right-0 top-full mt-2 w-48 bg-[#252b3b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">Moni Roy</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    admin@shophub.uz
                  </p>
                </div>
                {["Profile", "Account Settings", "Help"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <div className="border-t border-white/5">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-[#ff6584]/70 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile search overlay ───────────────────────────────────── */}
      {searchOpen && (
        <div className="sm:hidden absolute inset-0 z-30 flex items-center gap-3 px-4 bg-[#1a1f2e] border-b border-white/5">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
