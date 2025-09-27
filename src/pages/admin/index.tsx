import { Button, Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AdminSider from "../../components/layout/sider/admin.sider";

const { Content } = Layout;

const AdminPage = () => {
  const { logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <Layout style={{ minHeight: "60vh", background: "#fff" }}>
      <AdminSider />
      <Content style={{ padding: 24 }}>
        <div className="flex justify-end mb-3">
          <Button onClick={onLogout}>Đăng xuất</Button>
        </div>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AdminPage;