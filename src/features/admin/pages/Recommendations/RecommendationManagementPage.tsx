/**
 * RecommendationManagementPage - Admin
 * Manage recommendation system: trigger computations, view user recommendations
 */
import React, { useCallback, useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Tag,
  message,
  Tooltip,
  Modal,
  Empty,
  Spin,
  Alert,
  Divider,
  Rate,
  Select,
} from 'antd';
import {
  SyncOutlined,
  UserOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  FireOutlined,
  HeartOutlined,
  StarOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRecommendation } from '@/hooks/useRecommendation';
import { useAppSelector } from '@/hooks/redux';
import type { IRecommendationResponse, RecommendationReason } from '@/services/recommendation.service';
import { userService } from '@/services/user.service';

const { Title, Text } = Typography;

// Reason tag colors
const REASON_COLORS: Record<RecommendationReason, { color: string; icon: React.ReactNode }> = {
  CF: { color: 'blue', icon: <HeartOutlined /> },
  TRENDING: { color: 'orange', icon: <FireOutlined /> },
  CONTENT_BASED: { color: 'purple', icon: <EyeOutlined /> },
  POPULARITY: { color: 'green', icon: <StarOutlined /> },
  POPULAR_IN_CATEGORY: { color: 'cyan', icon: <BulbOutlined /> },
};

const RecommendationManagementPage: React.FC = () => {
  const {
    isComputing,
    isLoading,
    error,
    computeForUser,
    computeForAll,
    fetchUserRecommendations,
    clearError,
  } = useRecommendation();

  const allUserRecommendations = useAppSelector((state) => state.recommendation.userRecommendations);

  const [searchUserId, setSearchUserId] = useState('');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [computedUsers, setComputedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userService.getAllUsers({ page: 0, size: 100 });
        setUsers(response.result.content);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle compute for specific user
  const handleComputeForUser = useCallback(async () => {
    if (!searchUserId.trim()) {
      message.warning('Vui lòng nhập User ID');
      return;
    }

    try {
      await computeForUser(searchUserId.trim()).unwrap();
      message.success(`Đã tính toán gợi ý cho user ${searchUserId}`);
      setComputedUsers((prev) => [...new Set([...prev, searchUserId.trim()])]);
    } catch (err) {
      message.error('Có lỗi xảy ra khi tính toán gợi ý');
    }
  }, [searchUserId, computeForUser]);

  // Handle compute for all users
  const handleComputeForAll = useCallback(async () => {
    Modal.confirm({
      title: 'Xác nhận tính toán',
      content: 'Bạn có chắc muốn tính toán gợi ý cho TẤT CẢ người dùng? Quá trình này có thể mất vài phút.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await computeForAll().unwrap();
          message.success('Đã bắt đầu tính toán gợi ý cho tất cả người dùng');
        } catch (err) {
          message.error('Có lỗi xảy ra khi tính toán gợi ý');
        }
      },
    });
  }, [computeForAll]);

  // View user recommendations
  const handleViewRecommendations = useCallback(async () => {
    if (!searchUserId.trim()) {
      message.warning('Vui lòng nhập User ID');
      return;
    }

    try {
      await fetchUserRecommendations(searchUserId.trim(), { limit: 50 });
      setViewingUserId(searchUserId.trim());
      setIsModalVisible(true);
    } catch (err) {
      message.error('Không thể tải gợi ý cho người dùng này');
    }
  }, [searchUserId, fetchUserRecommendations]);

  // Table columns for recommendations
  const columns: ColumnsType<IRecommendationResponse> = [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => (
        <Tag color={rank <= 3 ? 'gold' : 'default'}>{rank}</Tag>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.product_image || '/placeholder.png'}
            alt={record.product_name}
            className="w-12 h-12 object-cover rounded"
          />
          <div>
            <div className="font-medium line-clamp-1">{record.product_name}</div>
            <div className="text-xs text-gray-400">ID: {record.product_id}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-orange-600 font-semibold">
            {record.final_price.toLocaleString()}₫
          </div>
          {record.price !== record.final_price && (
            <div className="text-xs text-gray-400 line-through">
              {record.price.toLocaleString()}₫
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 140,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Rate disabled value={record.average_rating} style={{ fontSize: 12 }} />
          <span className="text-xs text-gray-400">({record.review_count})</span>
        </div>
      ),
    },
    {
      title: 'Điểm gợi ý',
      dataIndex: 'recommendation_score',
      key: 'score',
      width: 100,
      render: (score: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {Math.round(score * 100)}%
          </div>
        </div>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'recommendation_reason',
      key: 'reason',
      width: 150,
      render: (reason: RecommendationReason) => {
        const config = REASON_COLORS[reason];
        return (
          <Tag color={config.color} icon={config.icon}>
            {reason}
          </Tag>
        );
      },
    },
    {
      title: 'Giải thích',
      dataIndex: 'explanation',
      key: 'explanation',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-gray-600 text-sm">{text}</span>
        </Tooltip>
      ),
    },
  ];

  // Current user recommendations
  const currentRecommendations = viewingUserId
    ? allUserRecommendations[viewingUserId] || []
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={3} className="!mb-1">
            Quản lý Hệ thống Gợi ý
          </Title>
          <Text type="secondary">
            Quản lý và tính toán gợi ý sản phẩm cho người dùng
          </Text>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title="Tính năng"
              value="Collaborative Filtering"
              valueStyle={{ fontSize: 16 }}
              prefix={<ThunderboltOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title="Users đã tính toán"
              value={computedUsers.length}
              prefix={<UserOutlined className="text-green-500" />}
              suffix="người dùng"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title="Trạng thái"
              value={isComputing ? 'Đang xử lý...' : 'Sẵn sàng'}
              valueStyle={{ color: isComputing ? '#faad14' : '#52c41a' }}
              prefix={
                isComputing ? (
                  <SyncOutlined spin className="text-yellow-500" />
                ) : (
                  <CheckCircleOutlined className="text-green-500" />
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-md transition-shadow">
            <Statistic
              title="Thuật toán"
              value="User-Based CF"
              valueStyle={{ fontSize: 16 }}
              prefix={<InfoCircleOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions Section */}
      <Card title="Hành động" className="shadow-sm">
        <div className="space-y-6">
          {/* User-specific actions */}
          <div>
            <Text strong className="block mb-3">
              Tìm kiếm và quản lý theo người dùng
            </Text>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                showSearch
                placeholder="Chọn hoặc nhập tên người dùng..."
                value={searchUserId || undefined}
                onChange={(value) => setSearchUserId(value)}
                loading={loadingUsers}
                className="flex-1 max-w-md"
                allowClear
                filterOption={(input, option) =>
                  (option?.label?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
                }
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.fullName || user.email} (${user.email})`,
                }))}
              />
              <Space wrap>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handleViewRecommendations}
                  loading={isLoading}
                >
                  Xem gợi ý
                </Button>
                <Button
                  type="primary"
                  icon={<SyncOutlined spin={isComputing} />}
                  onClick={handleComputeForUser}
                  loading={isComputing}
                  className="bg-blue-500"
                >
                  Tính toán cho User
                </Button>
              </Space>
            </div>
          </div>

          <Divider />

          {/* Global actions */}
          <div>
            <Text strong className="block mb-3">
              Hành động toàn hệ thống
            </Text>
            <Space wrap>
              <Button
                danger
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleComputeForAll}
                loading={isComputing}
                size="large"
              >
                Tính toán cho TẤT CẢ Users
              </Button>
            </Space>
            <div className="mt-2 text-sm text-gray-500">
              <InfoCircleOutlined className="mr-1" />
              Quá trình này sẽ tính toán lại gợi ý cho tất cả người dùng và có thể mất vài phút.
            </div>
          </div>
        </div>
      </Card>

      {/* Recently Computed Users */}
      {computedUsers.length > 0 && (
        <Card title="Users đã tính toán gần đây" className="shadow-sm">
          <div className="flex flex-wrap gap-2">
            {computedUsers.map((userId) => (
              <Tag
                key={userId}
                color="blue"
                className="cursor-pointer"
                onClick={() => {
                  setSearchUserId(userId);
                  handleViewRecommendations();
                }}
              >
                <UserOutlined className="mr-1" />
                {userId}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {/* User Recommendations Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShoppingOutlined className="text-orange-500" />
            <span>Gợi ý cho User: {viewingUserId}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="refresh"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => fetchUserRecommendations(viewingUserId!, { limit: 50 })}
            loading={isLoading}
          >
            Làm mới
          </Button>,
        ]}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" tip="Đang tải gợi ý..." />
          </div>
        ) : currentRecommendations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Không có gợi ý nào cho user này.
                <br />
                <Text type="secondary">
                  Hãy thử tính toán gợi ý trước.
                </Text>
              </span>
            }
          >
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={() => {
                setIsModalVisible(false);
                handleComputeForUser();
              }}
            >
              Tính toán ngay
            </Button>
          </Empty>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <Text type="secondary">
                Tìm thấy {currentRecommendations.length} gợi ý
              </Text>
              <Space>
                {Object.entries(REASON_COLORS).map(([reason, config]) => {
                  const count = currentRecommendations.filter(
                    (r) => r.recommendation_reason === reason
                  ).length;
                  return count > 0 ? (
                    <Tag key={reason} color={config.color} icon={config.icon}>
                      {reason}: {count}
                    </Tag>
                  ) : null;
                })}
              </Space>
            </div>
            <Table
              columns={columns}
              dataSource={currentRecommendations}
              rowKey="product_id"
              size="small"
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} gợi ý`,
              }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default RecommendationManagementPage;
