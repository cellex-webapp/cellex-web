import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  AppstoreOutlined,
  ShopOutlined,
  TeamOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  TagsOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  {
    key: 'order',
    label: <span className="text-white font-semibold">Quản lý đơn hàng</span>,
    icon: <AppstoreOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'order-all', label: <span className="text-white">Tất cả</span> },
      { key: 'order-shipping', label: <span className="text-white">Đơn vị vận chuyển</span> },
    ],
  },
  {
    key: 'product',
    label: <span className="text-white font-semibold">Quản lý Sản phẩm</span>,
    icon: <ShopOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'product-all', label: <span className="text-white">Tất cả sản phẩm</span> },
      { key: 'product-category', label: <span className="text-white">Danh mục sản phẩm</span> },
      { key: 'product-inventory', label: <span className="text-white">Quản lý tồn kho</span> },
      { key: 'product-violation', label: <span className="text-white">Sản phẩm vi phạm</span> },
    ],
  },
  {
    key: 'marketing',
    label: <span className="text-white font-semibold">Kênh Marketing</span>,
    icon: <TagsOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'marketing-coupon', label: <span className="text-white">Khuyến mãi của tôi</span> },
      { key: 'marketing-system', label: <span className="text-white">Khuyến mãi hệ thống</span> },
    ],
  },
  {
    key: 'customer',
    label: <span className="text-white font-semibold">Chăm sóc Khách hàng</span>,
    icon: <CustomerServiceOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'customer-message', label: <span className="text-white">Quản lý tin nhắn</span> },
      { key: 'customer-rating', label: <span className="text-white">Quản lý đánh giá</span> },
    ],
  },
  {
    key: 'finance',
    label: <span className="text-white font-semibold">Tài chính</span>,
    icon: <DollarOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'finance-revenue', label: <span className="text-white">Doanh thu</span> },
    ],
  },
  {
    key: 'data',
    label: <span className="text-white font-semibold">Dữ liệu</span>,
    icon: <DatabaseOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'data-analytics', label: <span className="text-white">Phân tích bán hàng</span> },
      { key: 'data-performance', label: <span className="text-white">Hiệu quả hoạt động</span> },
    ],
  },
  {
    key: 'shop',
    label: <span className="text-white font-semibold">Quản lý Shop</span>,
    icon: <TeamOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'shop-profile', label: <span className="text-white">Hồ sơ shop</span> },
    ],
  },
];

const VendorSider: React.FC = () => {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    // map specific keys to routes
    if (key === 'product-all') return navigate('/vendor/products');
    if (key === 'product-add') return navigate('/vendor/products/create');
    if (key === 'product-category') return navigate('/vendor/categories');
    // add more mappings if needed
  };
  return (
    <Sider
      width={260}
      breakpoint="lg"
      collapsedWidth={0}
      className="!sticky !top-0 !left-0 !h-screen !overflow-auto border-r border-white/10 !bg-gradient-to-b !from-indigo-700 !to-indigo-500 text-white"
    >
      <div className="text-white font-bold text-base px-5 pt-4 pb-2">Trung tâm điều khiển</div>
      <Menu
        mode="inline"
        theme="dark"
        defaultOpenKeys={[menuItems[0].key]}
        onClick={handleMenuClick}
        className="!border-r-0 !bg-transparent px-2 text-white
          [&_.ant-menu-sub]:!bg-transparent
          [&_.ant-menu-item]:m-0 [&_.ant-menu-item]:w-full [&_.ant-menu-item]:rounded-md
          [&_.ant-menu-item-selected]:!bg-white/20
          [&_.ant-menu-item:hover]:!bg-white/10
          [&_.ant-menu-item-selected_span]:!text-white
          [&_.ant-menu-item_span]:text-white/80"
        items={menuItems as any}
      />
    </Sider>
  );
};

export default VendorSider;
