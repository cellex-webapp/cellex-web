import React from 'react';
import { Layout, Menu, ConfigProvider } from 'antd';
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

// Local theme tokens for the Vendor sider (no external file)
const siderTheme = {
  background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
  borderColor: 'rgba(255,255,255,0.08)',
  menu: {
    primary: '#4f46e5', // indigo-600
    text: 'rgba(255,255,255,0.85)',
    hoverBg: 'rgba(255,255,255,0.06)',
    selectedBg: 'rgba(255,255,255,0.10)',
    hoverColor: '#ffffff',
    selectedColor: '#ffffff',
    subMenuBg: 'transparent',
    popupBg: 'transparent',
  },
} as const;

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
      { key: 'product-add', label: <span className="text-white">Thêm sản phẩm</span> },
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
  return (
    <Sider
      width={260}
      breakpoint="lg"
      collapsedWidth={0}
      className="!overflow-auto !h-screen !sticky !top-0 !left-0 text-white bg-gradient-to-b from-gray-900 to-gray-800 border-r border-white/10 min-w-[200px]"
    >
      <div className="text-white font-bold text-base px-5 pt-4 pb-2">Trung tâm điều khiển</div>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: siderTheme.menu.primary, // indigo-600
            colorText: '#ffffff',
          },
          components: {
            Menu: {
              darkItemBg: 'transparent',
              darkItemColor: siderTheme.menu.text,
              darkItemHoverBg: siderTheme.menu.hoverBg,
              darkItemSelectedBg: siderTheme.menu.selectedBg,
              darkItemHoverColor: siderTheme.menu.hoverColor,
              darkItemSelectedColor: siderTheme.menu.selectedColor,
              itemBorderRadius: 8,
              itemHeight: 40,
              itemMarginBlock: 4,
              itemPaddingInline: 12,
              subMenuItemBg: siderTheme.menu.subMenuBg,
              popupBg: siderTheme.menu.popupBg,
            },
            Layout: {
              siderBg: 'transparent',
            },
          },
        }}
      >
        <Menu
          mode="inline"
          theme="dark"
          defaultOpenKeys={[menuItems[0].key]}
          className="!bg-transparent !border-r-0"
          items={menuItems as any}
        />
      </ConfigProvider>
    </Sider>
  );
};

export default VendorSider;
