import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./styles/global.css";
import ReactDOM from "react-dom/client";
import { App, ConfigProvider } from "antd";
import "@ant-design/v5-patch-for-react-19";
import enUS from "antd/es/locale/en_US";
import { AppProvider } from "./components/context/app.context";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./layout";
import LoginPage from "./pages/auth/login";
import AdminPage from "./pages/admin";
import ClientPage from "./pages/client";
import VendorPage from "./pages/vendor";
import SignupPage from "./pages/auth/signup";
import OtpPage from "./pages/auth/otp";
import ForgotPasswordPage from "./pages/auth/forgot-password";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/" replace /> },
      {
        element: <ProtectedRoute roles={["guest"]} />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "otp", element: <OtpPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [{ path: "admin", element: <AdminPage /> }],
      },
      {
        element: <ProtectedRoute roles={["client"]} />,
        children: [{ path: "client", element: <ClientPage /> }],
      },
      {
        element: <ProtectedRoute roles={["vendor"]} />,
        children: [{ path: "vendor", element: <VendorPage /> }],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <App>
    <AppProvider>
      <ConfigProvider locale={enUS}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </AppProvider>
  </App>
);