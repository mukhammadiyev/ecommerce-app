import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import PlaceholderPage from "../components/common/PlaceholderPage.jsx";
import Home from "../pages/public/Home.jsx";
import Products from "../pages/public/Products.jsx";
import NotFound from "../pages/public/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      {
        path: "cart",
        element: (
          <PlaceholderPage
            title="Cart"
            description="Implement cart UI with local state or mock order service."
          />
        ),
      },
      {
        path: "login",
        element: (
          <PlaceholderPage
            title="Login"
            description="Build auth forms here. Mock login works via authService."
          />
        ),
      },
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
