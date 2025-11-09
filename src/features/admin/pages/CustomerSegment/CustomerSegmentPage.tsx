import React, { useEffect, useState } from 'react';
import { App, Button, Card, Table, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useCustomerSegment } from '@/hooks/useCustomerSegment';
import CustomerSegmentFormModal from './CustomerSegmentFormModal';
import type { ColumnsType } from 'antd/es/table';

const CustomerSegmentPageContent: React.FC = () => {
  const { modal, message } = App.useApp();
  const { segments, isLoading, fetchAllSegments, deleteSegment } = useCustomerSegment();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegmentResponse | null>(null);

  useEffect(() => {
    fetchAllSegments();
  }, [fetchAllSegments]);

  const handleOpenModal = (segment: CustomerSegmentResponse | null) => {
    setEditingSegment(segment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSegment(null);
  };

  const handleDelete = (id: string, name: string) => {
    modal.confirm({
      title: `Xóa phân khúc "${name}"?`,
      content: 'Không thể hoàn tác hành động này.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteSegment(id).unwrap();
          message.success('Đã xóa phân khúc');
        } catch (err: any) {
           message.error(err.message || 'Xóa thất bại');
        }
      }
    });
  };
  
  const columns: ColumnsType<CustomerSegmentResponse> = [
    { 
      title: 'Cấp độ (Level)', 
      dataIndex: 'level', 
      key: 'level',
      width: 120,
      align: 'center',
    },
    { 
      title: 'Tên phân khúc', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description', 
      ellipsis: true 
    },
    {
      title: 'Chi tiêu tối thiểu (VND)',
      dataIndex: 'minSpend',
      key: 'minSpend',
      align: 'right',
      render: (val) => val.toLocaleString('vi-VN'),
    },
    {
      title: 'Chi tiêu tối đa (VND)',
      dataIndex: 'maxSpend',
      key: 'maxSpend',
      align: 'right',
      render: (val) => val ? val.toLocaleString('vi-VN') : 'Không giới hạn',
    },
    {
      title: 'Hành động', 
      key: 'action', 
      width: 120, 
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id, record.name)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4">
      <Card
        title={<Space><UsergroupAddOutlined /> Quản lý Phân khúc Khách hàng</Space>}
        extra={<Button className='!bg-indigo-600' type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>Thêm phân khúc</Button>}
        className="shadow-sm"
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={segments}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
      
      <CustomerSegmentFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        editingSegment={editingSegment}
      />
    </div>
  );
};

const CustomerSegmentPage: React.FC = () => (
  <App>
    <CustomerSegmentPageContent />
  </App>
);

export default CustomerSegmentPage;