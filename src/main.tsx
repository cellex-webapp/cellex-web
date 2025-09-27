import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App, ConfigProvider } from "antd";
import enUS from "antd/es/locale/en_US";

import "./styles/global.css";
import "@ant-design/v5-patch-for-react-19";
import { AuthProvider } from "./context/auth.context";
import Layout from "./layout"; 
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/admin";
import CategoryPage from "./pages/admin/category/CategoryPage";

import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import DashboardPage from "./pages/dashboard";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import OtpPage from "./pages/auth/otp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { 
        index: true, 
        element: <DashboardPage /> 
      },
      {
        element: <ProtectedRoute roles={["ADMIN"]} />,
        children: [
          {
            path: "admin",
            element: <AdminPage />,
            children: [
              { path: "categories", element: <CategoryPage /> },
            ],
          },
        ],
      },
      {
        element: <PublicRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "otp", element: <OtpPage /> }
        ],
      },
      { path: "*", element: <div>Not Found</div> },
    ],
  },
]);

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App>
      <AuthProvider>
        <ConfigProvider locale={enUS}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AuthProvider>
    </App>
  </React.StrictMode>
);