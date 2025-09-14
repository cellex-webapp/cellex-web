import React from 'react';
import { Layout, Menu } from 'antd';
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
    key: 'overview',
    label: <span className="text-white font-semibold">Tổng quan</span>,
    icon: <AppstoreOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'overview-customer', label: <span className="text-white">Số liệu Khách hàng</span> },
      { key: 'overview-store', label: <span className="text-white">Số liệu Cửa hàng</span> },
      { key: 'overview-product', label: <span className="text-white">Số liệu Sản phẩm</span> },
    ],
  },
  {
    key: 'product',
    label: <span className="text-white font-semibold">Quản lý Sản phẩm</span>,
    icon: <ShopOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'product-all', label: <span className="text-white">Tất cả sản phẩm</span> },
      { key: 'product-violation', label: <span className="text-white">Sản phẩm vi phạm</span> },
    ],
  },
  {
    key: 'store',
    label: <span className="text-white font-semibold">Quản lý Cửa hàng</span>,
    icon: <ShopOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'store-all', label: <span className="text-white">Tất cả cửa hàng</span> },
      { key: 'store-violation', label: <span className="text-white">Cửa hàng vi phạm</span> },
      { key: 'store-voucher', label: <span className="text-white">Voucher cửa hàng</span> },
    ],
  },
  {
    key: 'member',
    label: <span className="text-white font-semibold">Quản lý thành viên</span>,
    icon: <TeamOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'member-all', label: <span className="text-white">Tất cả</span> },
      { key: 'member-type', label: <span className="text-white">Phân loại thành viên</span> },
    ],
  },
  {
    key: 'marketing',
    label: <span className="text-white font-semibold">Kênh Marketing</span>,
    icon: <TagsOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'marketing-system', label: <span className="text-white">Khuyến mãi hệ thống</span> },
      { key: 'marketing-store', label: <span className="text-white">Khuyến mãi cửa hàng</span> },
    ],
  },
  {
    key: 'customer',
    label: <span className="text-white font-semibold">Chăm sóc khách hàng</span>,
    icon: <CustomerServiceOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'customer-message', label: <span className="text-white">Trung tâm tin nhắn</span> },
      { key: 'customer-notify', label: <span className="text-white">Trung tâm thông báo</span> },
      { key: 'customer-comment', label: <span className="text-white">Kiểm duyệt bình luận</span> },
    ],
  },
  {
    key: 'finance',
    label: <span className="text-white font-semibold">Tài chính</span>,
    icon: <DollarOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'finance-revenue', label: <span className="text-white">Doanh thu</span> },
      { key: 'finance-performance', label: <span className="text-white">Hiệu quả hoạt động</span> },
    ],
  },
  {
    key: 'shipping',
    label: <span className="text-white font-semibold">Vận chuyển</span>,
    icon: <DatabaseOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'shipping-exchange', label: <span className="text-white">Đối tác vận chuyển</span> },
    ],
  },
  {
    key: 'profile',
    label: <span className="text-white font-semibold">Quản lý hồ sơ cá nhân</span>,
    icon: <TeamOutlined style={{ color: 'white' }} />,
    children: [
      { key: 'profile-password', label: <span className="text-white">Đổi mật khẩu</span> },
      { key: 'profile-logout', label: <span className="text-white">Đăng xuất</span> },
    ],
  },
];

const AdminSider: React.FC = () => {
  return (
    <Sider
      width={260}
      breakpoint="lg"
      collapsedWidth={0}
      className="!overflow-auto !h-screen !sticky !top-0 !left-0 !bg-primary-200 !border-r border-gray-200"
      style={{ minWidth: 200 }}
    >
      <div className="text-white font-bold text-base px-5 pt-4 pb-2">Trung tâm điều khiển</div>
      <Menu
        mode="inline"
        defaultOpenKeys={[menuItems[0].key]}
        className="!bg-primary-200 !border-r-0"
        items={menuItems}
      />
    </Sider>
  );
};

export default AdminSider;
