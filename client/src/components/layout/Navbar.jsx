import { useState, useEffect } from "react"; 
import { FaBagShopping, FaUserLarge } from "react-icons/fa6";
import { Link } from "react-router-dom"; 
import Logo from "../../../public/logo.png";
import useCartStore from "../../hooks/useCartStore.js";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Zustand store-dan ma'lumotlarni olamiz
  const cartItems = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart); 

  // Sahifa yuklanganda savatni yangilash
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCart();
    }
  }, [fetchCart]);

  // Savatdagi mahsulotlar soni
  const cartCount = cartItems.reduce((sum, i) => sum + (i.quantity || i.qty || 0), 0);

  return (
    <nav className="w-full sticky top-0 z-100 bg-white border-b border-gray-100 shadow-sm font-oxygen">
      <div className="w-full container mx-auto px-6 lg:px-8 2xl:px-27 py-4 lg:py-5">
        <div className="w-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
            <img src={Logo} alt="Logo" className="h-8 lg:h-10 object-contain" />
          </Link>
          
          {/* Markaziy Menyular */}
          <ul className="hidden lg:flex items-center justify-center gap-10">
            <li>
              <Link to="/" className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Blog
              </Link>
            </li>
          </ul>

          {/* O'ng tomon: Profil va Savat */}
          <div className="flex items-center justify-center gap-5 lg:gap-8">
            
            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer focus:outline-none"
              >
                <FaUserLarge className="text-lg" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                  
                  <Link
                    to="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Account Overview
                  </Link>

                  {/* 🔥 Bir xil rangda va emojishiz oddiy havola */}
                  <Link
                    to="/account/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Order History
                  </Link>

                  <Link
                    to="/account/billing"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Payment &amp; Billing
                  </Link>
                  
                  <Link
                    to="/account/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Account Settings
                  </Link>
                </div>
              )}
            </div>

            {/* Savat (Cart Icon) */}
            <Link 
              to="/cart" 
              className="relative p-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-50 transition-all inline-block"
            >
              <FaBagShopping className="text-xl cursor-pointer" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold leading-none ring-2 ring-white">
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