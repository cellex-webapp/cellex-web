import { Image, Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
import { EyeOutlined, AppstoreOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';

export const getAdminProductColumns = (
  onOpenDetail: (id: string) => void,
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
      <span title={r.shopInfo?.shop_name}>{r.shopInfo?.shop_name || '-'}</span>
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
    title: 'Giảm (%)',
    dataIndex: 'saleOff',
    key: 'saleOff',
    width: 90,
    align: 'right' as const,
    render: (v: number) => <span>{v ? `${v}%` : '0%'}</span>,
  },
  {
    title: 'Giá cuối (VND)',
    dataIndex: 'finalPrice',
    key: 'finalPrice',
    width: 130,
    align: 'right' as const,
    render: (v: number) => <span className="font-medium">{v?.toLocaleString() || '0'}</span>,
  },
  {
    title: 'Tồn kho',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
    width: 90,
    align: 'right' as const,
  },
  {
    title: 'Đánh giá',
    dataIndex: 'averageRating',
    key: 'averageRating',
    width: 90,
    align: 'center' as const,
    render: (v: number) => (v ?? 0).toFixed(2),
  },
  {
    title: 'Reviews',
    dataIndex: 'reviewCount',
    key: 'reviewCount',
    width: 90,
    align: 'right' as const,
  },
  {
    title: 'Đã bán',
    dataIndex: 'purchaseCount',
    key: 'purchaseCount',
    width: 90,
    align: 'right' as const,
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
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
  },
  {
    title: 'Hành động',
    key: 'action',
    width: 100,
    align: 'center' as const,
    render: (_: any, record: IProduct) => (
      <Space size="small">
        <Tooltip title="Xem chi tiết">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onOpenDetail(record.id)} />
        </Tooltip>
      </Space>
    ),
  },
];
