import { Button, Flex, Space, Typography, Layout } from "antd";
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
      <Content style={{ padding: 32 }}>
        <Flex vertical align="center" justify="center" style={{ minHeight: "60vh" }}>
          <Space direction="vertical" align="center">
            <Typography.Title level={2}>Admin Dashboard</Typography.Title>
            <Typography.Text>Welcome, Admin</Typography.Text>
            <Button onClick={onLogout}>Log out</Button>
          </Space>
        </Flex>
      </Content>
    </Layout>
  );
};

export default AdminPage;