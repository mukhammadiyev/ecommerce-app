import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import AdminRoute from "./AdminRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        lazy: () =>
          import("../pages/public/Home.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "products",
        lazy: () =>
          import("../pages/public/Products.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "products/:id",
        lazy: () =>
          import("../pages/public/ProductDetails.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "cart",
        lazy: () =>
          import("../pages/public/Cart.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "checkout",
        lazy: () =>
          import("../pages/public/Checkout.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "contact",
        lazy: () =>
          import("../pages/public/Contact.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "login",
        lazy: () =>
          import("../pages/auth/Login.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "register",
        lazy: () =>
          import("../pages/auth/Register.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "blogs",
        lazy: () =>
          import("../pages/public/Blogs.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "blogs/:id",
        lazy: () =>
          import("../pages/public/BlogDetails.jsx").then((m) => ({
            Component: m.default,
          })),
      },

      {
        path: "account",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            lazy: () =>
              import("../pages/account/AccountInformation.jsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "orders",
            lazy: () =>
              import("../pages/account/OrderHistory.jsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "billing",
            lazy: () =>
              import("../pages/account/PaymentBilling.jsx").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "settings",
            lazy: () =>
              import("../pages/account/Settings.jsx").then((m) => ({
                Component: m.default,
              })),
          },
        ],
      },
      {
        path: "*",
        lazy: () =>
          import("../pages/public/NotFound.jsx").then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
  {
    path: "admin",
    element: <AdminRoute />,
    children: [
      {
        index: true,
        lazy: () =>
          import("../pages/admin/Dashboard.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "products",
        lazy: () =>
          import("../pages/admin/AdminProducts.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "coupons",
        lazy: () =>
          import("../pages/admin/Coupons.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "inbox",
        lazy: () =>
          import("../pages/admin/Inbox.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "blogs",
        lazy: () =>
          import("../pages/admin/AdminBlogs.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "orders",
        lazy: () =>
          import("../pages/admin/Orders.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "newsletter",
        lazy: () =>
          import("../pages/admin/Newsletter.jsx").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "*",
        lazy: () =>
          import("../pages/public/NotFound.jsx").then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
]);

export default router;
