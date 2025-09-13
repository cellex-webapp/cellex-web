import { Outlet } from "react-router-dom";
import ClientHeader from "./components/header/client.header";
const Layout = () => {
  return (
    <>
      <ClientHeader />
      <Outlet />
    </>
  );
};

export default Layout;