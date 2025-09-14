import { Button, Flex, Layout, Space, Typography } from "antd";
import { logoutAPI } from "../../services/api";
import { useCurrentApp } from "../../components/context/app.context";
import VendorSider from "../../components/layout/sider/vendor.sider";

const { Content } = Layout;

const VendorPage = () => {
  const { user, setIsAuthenticated, setUser } = useCurrentApp();
  const onLogout = async () => {
    await logoutAPI();
    setIsAuthenticated(false);
    setUser(null);
  };
  return (
    <Layout style={{ minHeight: "60vh", background: "#fff" }}>
      <VendorSider />
      <Content style={{ padding: 32 }}>
        <Flex vertical align="center" justify="center" style={{ minHeight: "60vh" }}>
          <Space direction="vertical" align="center">
            <Typography.Title level={2}>Vendor Dashboard</Typography.Title>
            <Typography.Text>Welcome, {user?.username}</Typography.Text>
            <Button onClick={onLogout}>Log out</Button>
          </Space>
        </Flex>
      </Content>
    </Layout>
  );
};

export default VendorPage;
