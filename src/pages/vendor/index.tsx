import { Button, Flex, Layout, Space, Typography } from "antd";
import { useAuth } from "../../hooks/useAuth";
import VendorSider from "../../components/layout/sider/vendor.sider";

const { Content } = Layout;

const VendorPage = () => {
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
      <VendorSider />
      <Content style={{ padding: 32 }}>
        <Flex vertical align="center" justify="center" style={{ minHeight: "60vh" }}>
          <Space direction="vertical" align="center">
            <Typography.Title level={2}>Vendor Dashboard</Typography.Title>
            <Typography.Text>Welcome, Vendor</Typography.Text>
            <Button onClick={onLogout}>Log out</Button>
          </Space>
        </Flex>
      </Content>
    </Layout>
  );
};

export default VendorPage;