import { Image, Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
import { EyeOutlined, AppstoreOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';

export const getAdminProductColumns = (
  onOpenDetail: (id: string) => void,
  onDelete: (id: string) => void
) => [
  {
    title: 'Ảnh',
    dataIndex: 'images',
    key: 'images',
    width: 80,
    render: (images: string[]) =>
      images && images[0] ? (
        <Image
          src={images[0]}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          preview={{ mask: <EyeOutlined /> }}
        />
      ) : (
        <div className="w-[60px] h-[60px] bg-gray-100 rounded flex items-center justify-center">
          <AppstoreOutlined className="text-gray-400" />
        </div>
      ),
  },
  {
    title: 'Tên sản phẩm',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true,
    render: (text: string) => (
      <span className="font-medium" title={text}>
        {text}
      </span>
    ),
  },
  {
    title: 'Cửa hàng',
    key: 'shop',
    width: 150,
    ellipsis: true,
    render: (_: any, r: IProduct) => (
      <span title={r.shopInfo?.shopName}>{r.shopInfo?.shopName || '-'}</span>
    ),
  },
  {
    title: 'Danh mục',
    key: 'category',
    width: 130,
    ellipsis: true,
    render: (_: any, r: IProduct) => (
      <Tag color="blue" style={{ margin: 0 }}>
        {r.categoryInfo?.name || '-'}
      </Tag>
    ),
  },
  {
    title: 'Giá (VND)',
    dataIndex: 'price',
    key: 'price',
    width: 120,
    align: 'right' as const,
    render: (v: number) => (
      <span className="font-medium text-orange-600">{v?.toLocaleString() || '0'}</span>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'isPublished',
    key: 'isPublished',
    width: 110,
    align: 'center' as const,
    render: (v: boolean) => (
      <Tag icon={v ? <CheckCircleOutlined /> : undefined} color={v ? 'success' : 'default'} style={{ margin: 0 }}>
        {v ? 'Xuất bản' : 'Nháp'}
      </Tag>
    ),
  },
  {
    title: 'Hành động',
    key: 'action',
    width: 100,
    align: 'center' as const,
    fixed: 'right' as const,
    render: (_: any, record: IProduct) => (
      <Space size="small">
        <Tooltip title="Xem chi tiết">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onOpenDetail(record.id)} />
        </Tooltip>
        <Popconfirm
          title="Xóa sản phẩm?"
          description="Hành động này không thể hoàn tác"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => onDelete(record.id)}
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];
