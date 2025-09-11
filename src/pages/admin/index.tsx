import { Button, Flex, Space, Typography } from "antd";
import { logoutAPI } from "../../services/api";
import { useCurrentApp } from "../../components/context/app.context";

const AdminPage = () => {
  const { user, setIsAuthenticated, setUser } = useCurrentApp();
  const onLogout = async () => {
    await logoutAPI();
    setIsAuthenticated(false);
    setUser(null);
  };
  return (
    <Flex vertical align="center" justify="center" style={{ minHeight: "60vh" }}>
      <Space direction="vertical" align="center">
        <Typography.Title level={2}>Admin Dashboard</Typography.Title>
        <Typography.Text>Welcome, {user?.username}</Typography.Text>
        <Button onClick={onLogout}>Log out</Button>
      </Space>
    </Flex>
  );
};

export default AdminPage;
