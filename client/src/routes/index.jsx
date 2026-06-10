import { createBrowserRouter } from "react-router-dom";
import PlaceholderPage from "../components/common/PlaceholderPage.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import Home from "../pages/public/Home.jsx";
import NotFound from "../pages/public/NotFound.jsx";
import ProductDetails from "../pages/public/ProductDetails.jsx";
import Products from "../pages/public/Products.jsx";
import AdminRoute from "./AdminRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'
import Contact from '../pages/public/Contact.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetails /> },
      {
        path: "cart",
        element: (
          <PlaceholderPage
            title="Cart"
            description="Implement cart UI with local state or mock order service."
          />
        ),
      },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "account",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage
                title="My Account"
                description="Account pages live under pages/account/."
              />
            ),
          },
        ],
      },
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage
                title="Admin Dashboard"
                description="Admin pages live under pages/admin/."
              />
            ),
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
