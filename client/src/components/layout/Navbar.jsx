import { useState, useEffect } from "react"; // 👈 useEffect qo'shildi
import { FaBagShopping, FaUserLarge } from "react-icons/fa6";
import { Link } from "react-router-dom"; // 👈 Link importi shu yerda
import Logo from "../../../public/logo.png";
import useCartStore from "../../hooks/useCartStore.js";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Zustand store-dan ma'lumotlarni va yuklash funksiyasini olamiz
  const cartItems = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart); // 👈 fetchCart olindi

  // 🔥 Sahifa o'zgarganda yoki yuklanganda savatni har doim backend-dan yangilab turish
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCart();
    }
  }, [fetchCart]);

  // Savatdagi mahsulotlar sonini hisoblash (xavfsiz hisob-kitob)
  const cartCount = cartItems.reduce((sum, i) => sum + (i.quantity || i.qty || 0), 0);

  return (
    <nav className="w-full sticky top-0 z-100 bg-white shadow-sm">
      <div className="w-full container mx-auto px-8 2xl:px-27 py-5 2xl:py-10">
        <div className="w-full flex items-center justify-between">
          <Link to="/">
            <img src={Logo} alt="Logo" />
          </Link>
          
          {/* ⚡ HTML <a> teglari React Router <Link> teglari bilan almashtirildi */}
          <ul className="hidden lg:flex items-center justify-center gap-10">
            <li>
              <Link to="/" className="font-oxygen text-base text-gray-700 hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="font-oxygen text-base text-gray-700 hover:text-black transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link to="/contact" className="font-oxygen text-base text-gray-700 hover:text-black transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="font-oxygen text-base text-gray-700 hover:text-black transition-colors">
                Blog
              </Link>
            </li>
          </ul>

          <div className="flex items-center justify-center gap-4 2xl:gap-10">
            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <FaUserLarge className="text-xl text-gray-800 hover:text-black" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Account Overview
                  </Link>
                  <Link
                    to="/account/billing"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Payment &amp; Billing
                  </Link>
                  <Link
                    to="/account/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Account Settings
                  </Link>
                </div>
              )}
            </div>

            {/* Cart icon with badge */}
            <Link to="/cart" className="relative p-1 inline-block">
              <FaBagShopping className="text-xl cursor-pointer text-gray-800 hover:text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-[#1a1a2e] text-white text-[10px] font-bold leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;