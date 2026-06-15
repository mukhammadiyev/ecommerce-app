import { gsap } from "gsap";
import {
  Boxes,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Inbox,
  Layers,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Package,
  Phone,
  Settings,
  Table2,
  Tag,
  Users,
  Zap,
  BookOpen
} from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

const NAV_GROUPS = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
      { label: "Products", icon: Package, to: "/admin/products" },
      { label: "Inbox", icon: Inbox, to: "/admin/inbox" },
      { label: "Blogs", icon: BookOpen, to: "/admin/blogs" }, // ✅ To'g'rilandi
      { label: "Order Lists", icon: ListOrdered, to: "/admin/orders" },
    ],
  },
  // ... qolgan guruhlar
];
const BOTTOM_ITEMS = [
  { label: "Settings", icon: Settings, to: "/admin/settings" },
  { label: "Logout", icon: LogOut, to: "/logout", danger: true },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const sidebarRef = useRef(null);
  const itemsRef = useRef([]);
  const location = useLocation();

  // ── Mount: slide in from left ──────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      );
      gsap.fromTo(
        itemsRef.current.filter(Boolean),
        { x: -16, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.035,
          delay: 0.2,
        },
      );
    });
    return () => ctx.revert();
  }, []);

  // ── Width animation on collapse toggle ────────────────────────────
  useEffect(() => {
    gsap.to(sidebarRef.current, {
      width: collapsed ? 72 : 240,
      duration: 0.32,
      ease: "power2.inOut",
    });
  }, [collapsed]);

  const handleHover = (el, entering) => {
    gsap.to(el, { x: entering ? 4 : 0, duration: 0.18, ease: "power2.out" });
  };

  let idx = 0;

  return (
    <aside
      ref={sidebarRef}
      style={{ width: 240 }}
      className="relative flex flex-col h-screen bg-[#1a1f2e] border-r border-white/5 shrink-0 overflow-hidden"
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#6c63ff] shadow-lg shadow-[#6c63ff]/30 shrink-0">
          <Zap size={17} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">
            Dash<span className="text-[#6c63ff]">Stack</span>
          </span>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.label && !collapsed && (
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold tracking-widest text-white/25 uppercase">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-4 my-3 border-t border-white/10" />
            )}

            {group.items.map((item) => {
              const ref_idx = idx++;
              const Icon = item.icon;
              const active =
                item.to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.to);

              return (
                <div key={item.to} className="relative group px-2">
                  <NavLink
                    to={item.to}
                    ref={(el) => (itemsRef.current[ref_idx] = el)}
                    onMouseEnter={(e) => handleHover(e.currentTarget, true)}
                    onMouseLeave={(e) => handleHover(e.currentTarget, false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150
                      ${
                        active
                          ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/25"
                          : "text-white/45 hover:text-white hover:bg-white/5"
                      }
                      ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon size={18} className="shrink-0" />

                    {!collapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}

                    {/* Badge — visible text when expanded, dot when collapsed */}
                    {item.badge && !collapsed && (
                      <span className="ml-auto text-[10px] font-bold bg-[#ff6584] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {item.badge}
                      </span>
                    )}
                    {item.badge && collapsed && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff6584] rounded-full" />
                    )}
                  </NavLink>

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div
                      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                      px-2.5 py-1.5 bg-[#2a2f42] text-white text-xs font-medium rounded-lg
                      whitespace-nowrap opacity-0 group-hover:opacity-100
                      transition-opacity duration-150 z-50 shadow-xl border border-white/10"
                    >
                      {item.label}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2a2f42]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom items ─────────────────────────────────────────── */}
      <div className="border-t border-white/5 py-2 px-2 shrink-0">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.to} className="relative group">
              <NavLink
                to={item.to}
                onMouseEnter={(e) => handleHover(e.currentTarget, true)}
                onMouseLeave={(e) => handleHover(e.currentTarget, false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150
                  ${
                    item.danger
                      ? "text-[#ff6584]/60 hover:text-[#ff6584] hover:bg-[#ff6584]/10"
                      : "text-white/45 hover:text-white hover:bg-white/5"
                  }
                  ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>

              {collapsed && (
                <div
                  className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                  px-2.5 py-1.5 bg-[#2a2f42] text-white text-xs font-medium rounded-lg
                  whitespace-nowrap opacity-0 group-hover:opacity-100
                  transition-opacity duration-150 z-50 shadow-xl border border-white/10"
                >
                  {item.label}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2a2f42]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Collapse toggle — sits INSIDE sidebar at the bottom of logo row ── */}
      <button
        onClick={onToggle}
        className="absolute top-3 right-4 z-40
          w-10 h-10 rounded-sm
          bg-[#6c63ff] border-2 border-[#151929]
          flex items-center justify-center
          text-white shadow-lg
          hover:bg-[#5a52e0] transition-colors duration-150"
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </aside>
  );
}
