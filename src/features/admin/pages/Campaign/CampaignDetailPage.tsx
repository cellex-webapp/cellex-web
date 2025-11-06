import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Switch, App, Button, Card, Col, Descriptions, Form, Input, message, Row, Spin, Table, Tag } from 'antd';
import { useCoupon } from '@/hooks/useCoupon';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

const CampaignDetailPageContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  useEffect(() => {
    if (id) {
      fetchCampaignById(id);
      fetchCampaignLogs(id);
    }
    // Cleanup khi unmount
    return () => {
      clearSelectedCampaign();
    };
  }, [id, fetchCampaignById, fetchCampaignLogs, clearSelectedCampaign]);

  const handleDistribute = async (values: any) => {
    if (!id) return;
    
    // Xử lý filter
    const filter: DistributeFilter = {};
    if (values.all) {
      filter.all = true;
    }
    if (values.explicitUserIds) {
      filter.explicitUserIds = values.explicitUserIds.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    
    if (Object.keys(filter).length === 0) {
      message.error('Phải chọn ít nhất một tiêu chí để phát');
      return;
    }

    try {
      await distributeCampaign({ campaignId: id, filter }).unwrap();
      // Thông báo thành công đã ở trong slice
      form.resetFields();
    } catch (e) {
      // Lỗi đã ở trong slice
    }
  };

  const logColumns: ColumnsType<CampaignDistributionResponse> = [
    { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleString('vi-VN') },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'SUCCESS' ? 'green' : 'red'}>{s}</Tag>},
    { title: 'Thành công', dataIndex: 'totalSucceeded', key: 'totalSucceeded' },
    { title: 'Thất bại', dataIndex: 'totalFailed', key: 'totalFailed' },
    { title: 'Bỏ qua', dataIndex: 'totalSkipped', key: 'totalSkipped' },
    { title: 'Nội dung', dataIndex: 'message', key: 'message' },
  ];

  if (isLoading && !selectedCampaign) {
    return <div className="p-10 text-center"><Spin size="large" /></div>;
  }

  if (!selectedCampaign) {
    return <div className="p-10 text-center">Không tìm thấy campaign.</div>;
  }

  const canDistribute = selectedCampaign.status === 'DRAFT' || selectedCampaign.status === 'ACTIVE';

  return (
    <div className="p-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Chi tiết Campaign">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tiêu đề">{selectedCampaign.title}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag>{selectedCampaign.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Code">{selectedCampaign.codeTemplate || 'UNIQUE'}</Descriptions.Item>
              <Descriptions.Item label="Loại">{selectedCampaign.couponType}</Descriptions.Item>
              <Descriptions.Item label="Giá trị">{selectedCampaign.discountValue}</Descriptions.Item>
              <Descriptions.Item label="Phát / Dùng">{`${selectedCampaign.totalIssued} / ${selectedCampaign.totalRedeemed}`}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Phát Coupon">
            {canDistribute ? (
              <Form form={form} layout="vertical" onFinish={handleDistribute}>
                <Form.Item name="all" valuePropName="checked">
                  <Switch checkedChildren="Phát cho TẤT CẢ user" unCheckedChildren="Phát theo bộ lọc" />
                </Form.Item>
                <Form.Item name="explicitUserIds" label="Phát cho User IDs cụ thể (mỗi ID 1 dòng)">
                  <TextArea rows={4} placeholder="user_id_1&#10;user_id_2" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isLoading}>
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
          <Card title="Lịch sử phát coupon">
            <Table
              rowKey="id"
              columns={logColumns}
              dataSource={logs}
              loading={isLoading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const CampaignDetailPage: React.FC = () => (
  <App>
    <CampaignDetailPageContent />
  </App>
);

export default CampaignDetailPage;