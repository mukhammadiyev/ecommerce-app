import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import AccountInformation from "../pages/account/AccountInformation.jsx";
import PaymentBilling from "../pages/account/PaymentBilling.jsx";
import Settings from "../pages/account/Settings.jsx";
import OrderHistory from "../pages/account/OrderHistory.jsx"; // 🔥 Yangi qo'shildi
import AdminProducts from "../pages/admin/AdminProducts.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import AdminBlogs from "../pages/admin/AdminBlogs.jsx";
import Inbox from "../pages/admin/Inbox.jsx";
import AdminCoupons from "../pages/admin/Coupons.jsx"; 
import AdminOrders from "../pages/admin/Orders.jsx"; 
import AdminNewsletter from "../pages/admin/Newsletter.jsx"; 
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Cart from "../pages/public/Cart.jsx";
import Checkout from "../pages/public/Checkout.jsx";
import Contact from "../pages/public/Contact.jsx";
import Home from "../pages/public/Home.jsx";
import NotFound from "../pages/public/NotFound.jsx";
import ProductDetails from "../pages/public/ProductDetails.jsx";
import Products from "../pages/public/Products.jsx";
import AdminRoute from "./AdminRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Blogs from '../pages/public/Blogs.jsx';
import BlogDetails from '../pages/public/BlogDetails.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "blogs", element: <Blogs /> },
      { path: "blogs/:id", element: <BlogDetails /> },

      {
        path: "account",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <AccountInformation />,
          },
          {
            path: "orders", // 🔥 Navbar-dagi link bilan mos tushadi (/account/orders)
            element: <OrderHistory />,
          },
          {
            path: "billing",
            element: <PaymentBilling />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "admin",
    element: <AdminRoute />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "coupons", 
        element: <AdminCoupons />,
      },
      {
        path: "inbox",
        element: <Inbox />,
      },
      {
        path: "blogs",
        element: <AdminBlogs />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "newsletter",
        element: <AdminNewsletter />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;