import React, { useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Table, Space, Tooltip, Input, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useCustomerSegment } from '@/hooks/useCustomerSegment';
import CustomerSegmentFormModal from './CustomerSegmentFormModal';
import type { ColumnsType } from 'antd/es/table';

const CustomerSegmentPageContent: React.FC = () => {
  const { modal, message } = App.useApp();
  const { segments, isLoading, fetchAllSegments, deleteSegment } = useCustomerSegment();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegmentResponse | null>(null);
  const [q, setQ] = useState('');

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
      centered: true,
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
  
  const filteredSegments = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const list = Array.isArray(segments) ? segments : [];
    if (!kw) return list;
    return list.filter((s) =>
      s.name.toLowerCase().includes(kw) || (s.description || '').toLowerCase().includes(kw)
    );
  }, [q, segments]);
  
  const columns: ColumnsType<CustomerSegmentResponse> = [
    { 
      title: 'Cấp độ', 
      dataIndex: 'level', 
      key: 'level',
      align: 'center',
      render: (level: number) => (
        <Tag color="blue" style={{ margin: 0 }}>Lv {level}</Tag>
      ),
    },
    { 
      title: 'Tên phân khúc', 
      dataIndex: 'name', 
      key: 'name',
      ellipsis: true,
      render: (text) => <span className="font-medium" title={text}>{text}</span>
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description',
      ellipsis: true,
      render: (text: string | undefined) => text ? <span title={text}>{text}</span> : <span className="text-gray-400">—</span>
    },
    {
      title: 'Chi tiêu tối thiểu (VND)',
      dataIndex: 'minSpend',
      key: 'minSpend',
      align: 'right',
      width: 180,
      render: (val: number) => (typeof val === 'number' ? val.toLocaleString('vi-VN') : '—'),
    },
    {
      title: 'Chi tiêu tối đa (VND)',
      dataIndex: 'maxSpend',
      key: 'maxSpend',
      align: 'right',
      width: 200,
      render: (val?: number | null) => (typeof val === 'number' ? val.toLocaleString('vi-VN') : 'Không giới hạn'),
    },
    {
      title: 'Hành động', 
      key: 'action', 
      width: 120, 
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleOpenModal(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleDelete(record.id, record.name);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4">
      <Card
        title={<Space><UsergroupAddOutlined /> Quản lý Phân khúc Khách hàng</Space>}
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm phân khúc (tên/mô tả)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />
            <Button className='!bg-indigo-600' type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>Thêm phân khúc</Button>
          </Space>
        }
        className="shadow-sm"
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredSegments}
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} phân khúc` }}
          scroll={{ x: 900 }}
          size="middle"
          rowClassName="cursor-pointer"
          onRow={(record) => ({
            onClick: () => handleOpenModal(record),
          })}
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