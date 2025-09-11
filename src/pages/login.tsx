import { Button, Card, Flex, Radio, Space, Typography } from "antd";
import { useState } from "react";
import { loginAPI } from "../services/api";
import type { UserRole } from "../types/user";
import { useNavigate } from "react-router-dom";
import { useCurrentApp } from "../components/context/app.context";

const LoginPage = () => {
  const [role, setRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useCurrentApp();

  const onLogin = async () => {
    setLoading(true);
    try {
      const user = await loginAPI(role);
      setUser(user);
      setIsAuthenticated(true);
      navigate(`/${user.role}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Mock Login
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Choose a role to continue
          </Typography.Paragraph>
          <Radio.Group
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Radio.Button value="admin">Admin</Radio.Button>
              <Radio.Button value="client">Client</Radio.Button>
              <Radio.Button value="vendor">Vendor</Radio.Button>
            </Space>
          </Radio.Group>
          <Button type="primary" onClick={onLogin} loading={loading} block>
            Log in as {role}
          </Button>
        </Space>
      </Card>
    </Flex>
  );
};

export default LoginPage;
