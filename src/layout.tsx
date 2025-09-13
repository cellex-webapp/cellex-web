import { Outlet } from "react-router-dom";
import ClientHeader from "./components/header/client.header";
import Footer from "./components/header/footer";

const HEADER_HEIGHT = 68; 
const Layout = () => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <ClientHeader />
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