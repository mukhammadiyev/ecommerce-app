import { useState } from "react";
import { FaBagShopping, FaUserLarge } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Logo from "../../../public/logo.png";
import useCartStore from "../../hooks/useCartStore.js";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  return (
    <nav className="w-full sticky top-0 z-100 bg-white">
      <div className="w-full container mx-auto px-8 2xl:px-27 py-5 2xl:py-10">
        <div className="w-full flex items-center justify-between">
          <img src={Logo} alt="" />
          <ul className="hidden lg:flex items-center justify-center gap-10">
            <li>
              <a href="/" className="font-oxygen text-base">
                Home
              </a>
            </li>
            <li>
              <a href="/products" className="font-oxygen text-base">
                Products
              </a>
            </li>
            <li>
              <a href="/contact" className="font-oxygen text-base">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/blogs" className="font-oxygen text-base">
                Blog
              </a>
            </li>
          </ul>

          <div className="flex items-center justify-center gap-4 2xl:gap-10">
            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <FaUserLarge className="text-xl" />
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
                    Payment & Billing
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
            <Link to="/cart" className="relative">
              <FaBagShopping className="text-xl cursor-pointer" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-[#1a1a2e] text-white text-[10px] font-bold leading-none">
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
