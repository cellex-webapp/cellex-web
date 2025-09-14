import { Outlet } from "react-router-dom";
import GuestHeader from "./components/layout/header/guest.header";
import ClientHeader from "./components/layout/header/client.header";
import AdminHeader from "./components/layout/header/admin.header";
import Footer from "./components/layout/footer/footer";
import { useCurrentApp } from "./components/context/app.context";

const HEADER_HEIGHT = 68;

const Layout = () => {
  const { user } = useCurrentApp();

  let HeaderComponent = GuestHeader;
  if (user?.role === "admin" || user?.role === "vendor") {
    HeaderComponent = AdminHeader;
  } else if (user?.role === "client") {
    HeaderComponent = ClientHeader;
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <HeaderComponent />
      </div>
      <div style={{ paddingTop: HEADER_HEIGHT }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
export { Layout };