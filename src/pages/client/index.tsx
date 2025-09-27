import { Button, Flex, Space, Typography } from "antd";
import { useAuth } from "../../hooks/useAuth";
const ClientPage = () => {
  const { logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <Flex vertical align="center" justify="center" style={{ minHeight: "60vh" }}>
      <Space direction="vertical" align="center">
        <Typography.Title level={2}>Client Area</Typography.Title>
        <Typography.Text>Welcome, Client</Typography.Text>
        <Button onClick={onLogout}>Log out</Button>
      </Space>
    </Flex>
  );
};

export default ClientPage;