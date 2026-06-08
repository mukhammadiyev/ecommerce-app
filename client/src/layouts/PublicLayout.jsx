import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-bold">
            Ecommerce
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/products" className="hover:text-slate-600">
              Products
            </Link>
            <Link to="/cart" className="hover:text-slate-600">
              Cart
            </Link>
            <Link to="/login" className="hover:text-slate-600">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
          Frontend-only mode — mock API enabled
        </div>
      </footer>
    </div>
  );
}
