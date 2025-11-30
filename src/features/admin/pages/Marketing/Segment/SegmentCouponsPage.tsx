import React, { useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Table, Space, Tooltip, Input, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import useSegmentCoupon from '@/hooks/useSegmentCoupon';
import { useCustomerSegment } from '@/hooks/useCustomerSegment';
import SegmentCouponFormModal from './SegmentCouponFormModal';
import type { ColumnsType } from 'antd/es/table';

const SegmentCouponsPage: React.FC = () => {
  const { modal, message } = App.useApp();
  const { items, isLoading, fetchAll, create, update, remove } = useSegmentCoupon();
  const { segments, fetchAllSegments } = useCustomerSegment();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentCouponResponse | null>(null);
  const [q, setQ] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  useEffect(() => {
    if (segments.length === 0) fetchAllSegments();
  }, [segments.length, fetchAllSegments]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return items;
    return items.filter((c) =>
      c.title.toLowerCase().includes(kw) || (c.description || '').toLowerCase().includes(kw) || c.codePrefix.toLowerCase().includes(kw)
    );
  }, [q, items]);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (record: SegmentCouponResponse) => { setEditing(record); setOpen(true); };

  const handleDelete = (id: string, name?: string) => {
    modal.confirm({
      title: `Xóa coupon${name ? ` "${name}"` : ''}?`,
      content: 'Không thể hoàn tác hành động này.',
      okText: 'Xóa',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          await remove(id).unwrap();
          message.success('Đã xóa coupon');
        } catch (err: any) {
          message.error(err?.message || 'Xóa thất bại');
        }
      }
    });
  };

  const segMap = useMemo(() => Object.fromEntries(segments.map(s => [s.id, s.name])), [segments]);

  const frequencyToVi = (f: ScheduleFrequency): string => {
    switch (f) {
      case 'NONE': return 'Không lịch';
      case 'DAILY': return 'Hàng ngày';
      case 'WEEKLY': return 'Hàng tuần';
      case 'MONTHLY': return 'Hàng tháng';
      case 'YEARLY': return 'Hàng năm';
      default: return String(f);
    }
  };

  const columns: ColumnsType<SegmentCouponResponse> = [
    {
      title: 'Mã',
      dataIndex: 'codePrefix',
      key: 'codePrefix',
      width: 120,
      render: (v) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => <span className="font-medium" title={text}>{text}</span>,
    },
    {
      title: 'Phân khúc',
      dataIndex: 'segmentId',
      key: 'segmentId',
      width: 220,
      render: (id: string) => <span title={segMap[id] || id}>{segMap[id] || id}</span>,
    },
    {
      title: 'Giảm',
      key: 'discount',
      width: 140,
      render: (_, r) => (
        <span>
          {r.discountType === 'PERCENTAGE' ? `${r.discountValue}%` : `${r.discountValue.toLocaleString('vi-VN')}đ`}
        </span>
      ),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'} style={{ margin: 0 }}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Tần suất',
      dataIndex: 'scheduleFrequency',
      key: 'scheduleFrequency',
      width: 140,
      render: (f: ScheduleFrequency) => frequencyToVi(f),
    },
    {
      title: 'Lần phát tiếp theo',
      dataIndex: 'nextScheduledDate',
      key: 'nextScheduledDate',
      width: 200,
      render: (s?: string | null) => s ? new Date(s).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={(e) => { e.stopPropagation(); openEdit(record); }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => { e.stopPropagation(); handleDelete(record.id, record.title); }}
            />
          </Tooltip>
        </Space>
      )
    },
  ];

  return (
    <div className="p-4">
      <Card
        title={<Space><GiftOutlined /> Coupons theo Phân khúc</Space>}
        extra={
          <Space>
            <Input
              placeholder="Tìm theo tiêu đề/mô tả/mã"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />
            <Button type="primary" className="!bg-indigo-600" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm coupon
            </Button>
          </Space>
        }
        className="shadow-sm"
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={Array.isArray(filtered) ? filtered : []}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          size="middle"
          rowClassName="cursor-pointer"
          onRow={(record) => ({ onClick: () => openEdit(record) })}
        />
      </Card>

      <SegmentCouponFormModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        submitting={submitting}
        onSubmit={async (values) => {
          try {
            setSubmitting(true);
            if (editing) {
              await update(editing.id, values as UpdateSegmentCouponRequest).unwrap();
            } else {
              await create(values as CreateSegmentCouponRequest).unwrap();
            }
            setOpen(false);
          } catch (err: any) {
            message.error(err?.message || 'Thao tác thất bại');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
};

const SegmentCouponsPageWithApp: React.FC = () => (
  <App>
    <SegmentCouponsPage />
  </App>
);

export default SegmentCouponsPageWithApp;
