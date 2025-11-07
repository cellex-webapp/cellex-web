import React, { useEffect, useState } from 'react';
import { App, Button, Card, Table, Tabs, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useCoupon } from '@/hooks/useCoupon';
import CampaignFormModal from './CampaignFormModal'; 
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;

const statusTabs: { key: CampaignStatus, label: string }[] = [
  { key: 'DRAFT', label: 'Bản nháp' },
  { key: 'SCHEDULED', label: 'Đã lên lịch' },
  { key: 'ACTIVE', label: 'Đang chạy' },
  { key: 'COMPLETED', label: 'Đã hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const CampaignListPageContent: React.FC = () => {
  const { modal, message } = App.useApp();
  const { campaigns, fetchCampaignsByStatus, deleteCampaign } = useCoupon();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<CampaignStatus>('DRAFT');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CouponCampaignResponse | null>(null);
  // detail navigation handled via route

  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setListLoading(true);
      try {
        await fetchCampaignsByStatus(activeTab);
      } catch (e) {
      } finally {
        if (mounted) setListLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [activeTab, fetchCampaignsByStatus]);

  const handleOpenModal = (campaign: CouponCampaignResponse | null) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleDelete = (id: string, title: string) => {
    modal.confirm({
      centered: true,
      title: `Xóa campaign "${title}"?`,
      content: 'Không thể hoàn tác hành động này.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteCampaign(id).unwrap();
          message.success('Đã xóa campaign');
        } catch (e) {
        }
      }
    });
  };
  
  const columns: ColumnsType<CouponCampaignResponse> = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: 'Loại', dataIndex: 'couponType', key: 'couponType',
      render: (type: CouponType) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Giá trị', dataIndex: 'discountValue', key: 'discountValue',
      render: (val, record) => record.couponType === 'PERCENTAGE' ? `${val}%` : val.toLocaleString() + ' ₫'
    },
    { title: 'Code', dataIndex: 'codeTemplate', key: 'codeTemplate', render: (code) => code || <Tag>UNIQUE</Tag> },
    { title: 'Đã phát', dataIndex: 'totalIssued', key: 'totalIssued' },
    { title: 'Đã dùng', dataIndex: 'totalRedeemed', key: 'totalRedeemed' },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', render: (date) => new Date(date).toLocaleString('vi-VN')},
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', render: (date) => new Date(date).toLocaleString('vi-VN')},
    {
      title: 'Hành động', key: 'action', width: 120, align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem & Phát">
            <Button icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); navigate(`/admin/campaigns/${record.id}`); }} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleOpenModal(record); }} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id, record.title); }} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4">
      <Card
        title="Quản lý Chiến dịch Khuyến mãi"
        extra={<Button className='!bg-indigo-600' type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>Tạo mới</Button>}
      >
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as CampaignStatus)}>
          {statusTabs.map(tab => (
            <TabPane tab={tab.label} key={tab.key} />
          ))}
        </Tabs>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={campaigns}
          loading={listLoading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => {
              navigate(`/admin/campaigns/${record.id}`);
            }
          })}
          scroll={{ x: 1000 }}
        />
      </Card>
      
      <CampaignFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        editingCampaign={editingCampaign}
      />
    </div>
  );
};

const CampaignListPage: React.FC = () => (
  <App>
    <CampaignListPageContent />
  </App>
);

export default CampaignListPage;