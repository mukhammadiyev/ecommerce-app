import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";

export default function AdminLayout() {
  // Desktop: expanded by default. Mobile: hidden by default.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile, always keep sidebar collapsed (icon-only doesn't make sense on mobile — we use the drawer)
      if (mobile) setCollapsed(false); // reset so when drawer opens it's full width
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex h-screen bg-[#151929] overflow-hidden">
      {/* ── Mobile overlay ── */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {isMobile ? (
        // Mobile: full sidebar in a fixed drawer
        <div
          className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <AdminSidebar
            collapsed={false}
            onToggle={() => setMobileSidebarOpen(false)}
          />
        </div>
      ) : (
        // Desktop: inline, collapsible
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminNavbar onMenuToggle={() => setMobileSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto p-6 text-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
