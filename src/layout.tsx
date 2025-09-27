import { Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import GuestHeader from "./components/layout/header/guest.header";
import ClientHeader from "./components/layout/header/client.header";
import AdminHeader from "./components/layout/header/admin.header";
import Footer from "./components/layout/footer/footer";

const HEADER_HEIGHT = 68; 

const Layout = () => {
  const { role, loading } = useAuth();

  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  let HeaderComponent = GuestHeader;
  if (role === "ADMIN" || role === "VENDOR") {
    HeaderComponent = AdminHeader;
  } else if (role === "CLIENT") {
    HeaderComponent = ClientHeader;
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <HeaderComponent />
      </div>

      <main style={{ paddingTop: HEADER_HEIGHT, minHeight: 'calc(100vh - 150px)' }}> 
        <Outlet /> 
      </main>

      <Footer />
    </>
  );
};

export default Layout;