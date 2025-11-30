import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Switch, App, Button, Card, Col, Descriptions, Form, Input, message, Row, Spin, Table, Tag, Tooltip, Select, Avatar } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useCoupon } from '@/hooks/useCoupon';
import type { ColumnsType } from 'antd/es/table';
import { useUser } from '@/hooks/useUser';

const { Title } = Typography;

interface MarketingSystemPageContentProps {
  campaignId?: string | null;
}

const MarketingSystemPageContent: React.FC<MarketingSystemPageContentProps> = ({ campaignId = null }) => {
  const params = useParams<{ id: string }>();
  const id = campaignId ?? params.id;
  const [form] = Form.useForm();
  const {
    selectedCampaign,
    logs,
    isLoading,
    fetchCampaignById,
    fetchCampaignLogs,
    distributeCampaign,
    clearSelectedCampaign
  } = useCoupon();
  const { users, fetchAllUsers, isLoading: usersLoading } = useUser();

  const allSwitchOn = Form.useWatch('all', form);

  const userOptions = (Array.isArray(users) ? users : [])
    .filter((u) => u.role === 'USER')
    .map((u) => ({
      label: (
        <div className="flex items-center gap-2">
          <Avatar size="small" src={u.avatarUrl}>
            {u.fullName?.charAt(0)}
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span>{u.fullName}</span>
            <span className="text-xs text-gray-500">{u.email || u.phoneNumber}</span>
          </div>
          {u.banned ? <Tag color="red">Banned</Tag> : (!u.active ? <Tag>Inactive</Tag> : null)}
        </div>
      ),
      value: u.id,
    }));

  const renderUserTag = (tagProps: any) => {
    const { value, closable, onClose } = tagProps;
    const u = (Array.isArray(users) ? users : []).find((uu) => uu.id === value);
    return (
      <Tag closable={closable} onClose={onClose} style={{ marginRight: 4 }}>
        {u?.fullName || value}
      </Tag>
    );
  };

  useEffect(() => {
    if (id) {
      fetchCampaignById(id);
      fetchCampaignLogs(id);
    }
    fetchAllUsers();
    return () => {
      clearSelectedCampaign();
    };
  }, [id, fetchCampaignById, fetchCampaignLogs, clearSelectedCampaign, fetchAllUsers]);

  const handleDistribute = async (values: any) => {
    if (!id) return;

    const filter: DistributeFilter = {};
    if (values.all) {
      filter.all = true;
    }

    const selectedIds: string[] = Array.isArray(values.selectedUserIds) ? values.selectedUserIds : [];

    if (selectedIds.length > 0) {
      filter.explicitUserIds = selectedIds;
    }

    if (Object.keys(filter).length === 0) {
      message.error('Phải chọn ít nhất một tiêu chí để phát');
      return;
    }

    try {
      await distributeCampaign({ campaignId: id, filter }).unwrap();
      form.resetFields(['all', 'selectedUserIds']);
    } catch (e) {
    }
  };

  // --- CẬP NHẬT COLUMNS CHO LOGS ---
  const logColumns: ColumnsType<CampaignDistributionResponse> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Gửi tới',
      dataIndex: 'recipientsCount',
      key: 'recipientsCount'
    },
    {
      title: 'Thành công',
      dataIndex: 'successCount',
      key: 'successCount',
      render: (val) => <Tag color="green">{val}</Tag>
    },
    {
      title: 'Thất bại',
      dataIndex: 'failedCount',
      key: 'failedCount',
      render: (val) => <Tag color={val > 0 ? 'red' : 'default'}>{val}</Tag>
    },
    {
      title: 'Chi tiết lỗi',
      dataIndex: 'errorSummary',
      key: 'errorSummary',
      render: (val) => val || '—'
    },
    {
      title: 'Thời gian (ms)',
      dataIndex: 'executionTimeMs',
      key: 'executionTimeMs',
    }
  ];

  if (isLoading && !selectedCampaign) {
    return <div className="p-10 text-center"><Spin size="large" /></div>;
  }

  if (!selectedCampaign) {
    return <div className="p-10 text-center">Không tìm thấy campaign.</div>;
  }

  const canDistribute = selectedCampaign.status === 'DRAFT' || selectedCampaign.status === 'ACTIVE';

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="flex items-center justify-center p-4">
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <Row gutter={[16, 16]} className="items-stretch">
          <Col xs={24} md={12}>
            <Card title={<Title level={4} style={{ margin: 0 }}>Chi tiết Campaign</Title>} className="shadow-sm" style={{ height: '100%' }}>
              <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 600 }}>
                <Descriptions.Item label="Tiêu đề">{selectedCampaign.title}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái"><Tag>{selectedCampaign.status}</Tag></Descriptions.Item>
                <Descriptions.Item label="Code">{selectedCampaign.codeTemplate || <Tag>UNIQUE</Tag>}</Descriptions.Item>
                <Descriptions.Item label="Loại">{selectedCampaign.couponType}</Descriptions.Item>
                <Descriptions.Item label="Giá trị">{selectedCampaign.discountValue}</Descriptions.Item>
                {/* --- CẬP NHẬT TRƯỜNG HIỂN THỊ --- */}
                <Descriptions.Item label="Đã phát (hiện tại)">{selectedCampaign.currentIssuance}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={<Title level={4} style={{ margin: 0 }}>Phát Coupon</Title>} className="shadow-sm" style={{ height: '100%' }}>
              {canDistribute ? (
                <Form form={form} layout="vertical" onFinish={handleDistribute}>
                  <Form.Item name="all" valuePropName="checked">
                    <Tooltip title="Bật để gửi cho tất cả người dùng, tắt để lọc theo ID.">
                      <div className="flex items-center">
                        <Switch
                          checkedChildren="TẤT CẢ"
                          unCheckedChildren="Bộ lọc"
                        />
                        <span className={`ml-3 px-2 py-1 rounded text-sm ${allSwitchOn ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                          {allSwitchOn ? 'Phát cho TẤT CẢ user' : 'Phát theo bộ lọc'}
                        </span>
                      </div>
                    </Tooltip>
                  </Form.Item>
                  <Form.Item name="selectedUserIds" label="Chọn người dùng (có thể nhiều)" tooltip="Chỉ hiển thị tài khoản có role USER">
                    <Select
                      mode="multiple"
                      allowClear
                      showSearch
                      size="large"
                      placeholder="Chọn người dùng từ danh sách"
                      options={userOptions}
                      loading={!!usersLoading}
                      disabled={!!allSwitchOn}
                      maxTagCount="responsive"
                      listHeight={340}
                      tagRender={renderUserTag}
                      filterOption={(input, option) => {
                        const id = option?.value as string;
                        const u = (users || []).find(uu => uu.id === id);
                        const hay = `${u?.fullName || ''} ${u?.email || ''} ${u?.phoneNumber || ''}`.toLowerCase();
                        return hay.includes((input || '').toLowerCase());
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      className='!bg-indigo-600'
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      size="large"
                      icon={<SendOutlined />}
                    >
                      Bắt đầu phát
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <p>Campaign ở trạng thái {selectedCampaign.status} không thể phát.</p>
              )}
            </Card>
          </Col>

          <Col span={24}>
            <Card title={<Title level={4} style={{ margin: 0 }}>Lịch sử phát coupon</Title>} className="shadow-sm">
              <Table
                rowKey="id"
                columns={logColumns}
                dataSource={Array.isArray(logs) ? logs : []}
                loading={isLoading}
                pagination={false}
                size="small"
                scroll={{ x: 600 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const CampaignDetailPage: React.FC = () => (
  <App>
    <MarketingSystemPageContent />
  </App>
);

export { MarketingSystemPageContent };
export default CampaignDetailPage;