import { FaBagShopping, FaUserLarge } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Logo from "../../../public/logo.png";
function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-9999 bg-white">
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
              <a href="/products" className="font-oxygen text-base">
                Blog
              </a>
            </li>
          </ul>
          <div className="flex items-center justify-center gap-4 2xl:gap-10">
            <Link to={'/account'}>
              <FaUserLarge className="text-xl" />
            </Link>
            <FaBagShopping className="text-xl" />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
