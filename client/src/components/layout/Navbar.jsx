import gsap from "gsap"; // Imported GSAP
import { useEffect, useRef, useState } from "react";
import { FaBagShopping, FaBars, FaUserLarge, FaXmark } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Logo from "@/assets/logo.png";
import useCartStore from "../../hooks/useCartStore.js";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Animation Refs
  const overlayRef = useRef(null);
  const drawerRef = useRef(null);
  const linksRef = useRef([]);

  const cartItems = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCart();
    }
  }, [fetchCart]);

  // GSAP Animation Logic for Mobile Menu
  useEffect(() => {
    if (menuOpen) {
      // 1. Make the overlay container visible before animating
      gsap.set(overlayRef.current, { display: "block" });

      // 2. Animate background blur fade-in
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // 3. Slide the menu drawer in from the right
      gsap.to(drawerRef.current, {
        x: 0,
        duration: 0.4,
        ease: "power3.out",
      });

      // 4. Staggered fade-up animation for the links
      gsap.fromTo(
        linksRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.1,
        },
      );
    } else {
      // Create a timeline to handle the close sequence smoothly
      const tl = gsap.timeline({
        onComplete: () => {
          // Hide container completely after animation finishes
          gsap.set(overlayRef.current, { display: "none" });
        },
      });

      tl.to(drawerRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power3.in",
      }).to(
        overlayRef.current,
        { opacity: 0, duration: 0.3, ease: "power2.in" },
        "-=0.2", // Overlap animations slightly for a snappier feel
      );
    }
  }, [menuOpen]);

  const cartCount = cartItems.reduce(
    (sum, i) => sum + (i.quantity || i.qty || 0),
    0,
  );

  return (
    <nav className="w-full sticky top-0 z-100 bg-white border-b border-gray-100 shadow-sm font-oxygen">
      <div className="w-full container mx-auto px-6 lg:px-8 2xl:px-27 py-4 lg:py-5">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-90">
            <img src={Logo} alt="Go to homepage" className="h-4 lg:h-5 object-contain" />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center justify-center gap-10">
            <li>
              <Link
                to="/"
                className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/blogs"
                className="text-base text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Blog
              </Link>
            </li>
          </ul>

          {/* Right Section */}
          <div className="flex items-center justify-center gap-3 lg:gap-8">
            {/* Account Dropdown */}
            <div className="relative">
              <button
                aria-label="Open user account overview"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all focus:outline-none"
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

            {/* Cart Icon */}
            <Link
              to="/cart"
              aria-label="Read more about Seminole tax hike"
              className="relative p-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-50 transition-all inline-block"
            >
              <FaBagShopping className="text-xl cursor-pointer" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold leading-none ring-2 ring-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              aria-label="Open user account overview"
              onClick={() => setMenuOpen(true)}
              className="block lg:hidden p-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-50 transition-all focus:outline-none"
            >
              <FaBars className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* --- GSAP Animated Mobile Menu Modal --- */}
      <div
        ref={overlayRef}
        style={{ display: "none" }} // Handled initially via GSAP set
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-150 lg:hidden opacity-0"
        onClick={() => setMenuOpen(false)} // Closes if clicking backdrop
      >
        {/* Drawer Content */}
        <div
          ref={drawerRef}
          style={{ transform: "translateX(100%)" }} // Starts offscreen
          className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside drawer
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <img src={Logo} alt="Logo" className="h-6 object-contain" />
              <button
                aria-label="Close mobile navigation menu"
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-50 transition-all focus:outline-none"
              >
                <FaXmark className="text-xl" />
              </button>
            </div>

            {/* Links List with staggered refs */}
            <ul className="flex flex-col gap-6 pt-10">
              <li ref={(el) => (linksRef.current[0] = el)}>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block text-xl text-gray-800 hover:text-indigo-600 font-semibold transition-colors"
                >
                  Home
                </Link>
              </li>
              <li ref={(el) => (linksRef.current[1] = el)}>
                <Link
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                  className="block text-xl text-gray-800 hover:text-indigo-600 font-semibold transition-colors"
                >
                  Products
                </Link>
              </li>
              <li ref={(el) => (linksRef.current[2] = el)}>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="block text-xl text-gray-800 hover:text-indigo-600 font-semibold transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li ref={(el) => (linksRef.current[3] = el)}>
                <Link
                  to="/blogs"
                  onClick={() => setMenuOpen(false)}
                  className="block text-xl text-gray-800 hover:text-indigo-600 font-semibold transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-xs text-gray-400 text-center pt-6 border-t border-gray-50">
            © {new Date().getFullYear()} Your Show Room.
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
