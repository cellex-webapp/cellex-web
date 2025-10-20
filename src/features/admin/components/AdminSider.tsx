import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined, ShopOutlined, TeamOutlined, DollarOutlined,
  CustomerServiceOutlined, TagsOutlined, DatabaseOutlined, PartitionOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const MENU_CONFIG = [
  {
    key: 'overview', label: 'Tổng quan', icon: AppstoreOutlined,
    children: [
      { key: 'overview-customer', label: 'Số liệu Khách hàng', path: '/admin/overview/customer' },
      { key: 'overview-store', label: 'Số liệu Cửa hàng', path: '/admin/overview/store' },
      { key: 'overview-product', label: 'Số liệu Sản phẩm', path: '/admin/overview/product' },
    ],
  },
  {
    key: 'category', label: 'Quản lý Danh mục', icon: PartitionOutlined,
    children: [
      { key: 'category-all', label: 'Tất cả danh mục', path: '/admin/categories' },
      { key: 'category-create', label: 'Tạo danh mục', path: '/admin/categories/create' },
    ],
  },
  {
    key: 'product', label: 'Quản lý Sản phẩm', icon: ShopOutlined,
    children: [
      { key: 'product-all', label: 'Tất cả sản phẩm', path: '/admin/products' },
      { key: 'product-violation', label: 'Sản phẩm vi phạm', path: '/admin/products/violations' },
    ],
  },
  {
    key: 'user', label: 'Quản lý Người dùng', icon: TeamOutlined,
    children: [
      { key: 'user-all', label: 'Tất cả người dùng', path: '/admin/users' },
      { key: 'user-create', label: 'Tạo người dùng', path: '/admin/users/create' },
    ],
  },
  {
    key: 'store', label: 'Quản lý Cửa hàng', icon: TeamOutlined,
    children: [
      { key: 'store-all', label: 'Tất cả cửa hàng', path: '/admin/shops' },
      { key: 'store-create', label: 'Tạo cửa hàng', path: '/admin/shops/create' },
      { key: 'store-requests', label: 'Yêu cầu mở cửa hàng', path: '/admin/shops/pending' },
    ],
  },
  {
    key: 'finance', label: 'Tài chính', icon: DollarOutlined,
    children: [
      { key: 'finance-revenue', label: 'Doanh thu', path: '/admin/finance/revenue' },
    ],
  },
  {
    key: 'customer', label: 'Chăm sóc Khách hàng', icon: CustomerServiceOutlined,
    children: [
      { key: 'customer-message', label: 'Quản lý tin nhắn', path: '/admin/customers/messages' },
      { key: 'customer-rating', label: 'Quản lý đánh giá', path: '/admin/customers/ratings' },
    ],
  },
  {
    key: 'marketing', label: 'Kênh Marketing', icon: TagsOutlined,
    children: [
      { key: 'marketing-coupon', label: 'Khuyến mãi của tôi', path: '/admin/marketing/coupons' },
      { key: 'marketing-system', label: 'Khuyến mãi hệ thống', path: '/admin/marketing/system' },
    ],
  },
  {
    key: 'data', label: 'Dữ liệu', icon: DatabaseOutlined,
    children: [
      { key: 'data-analytics', label: 'Phân tích bán hàng', path: '/admin/data/analytics' },
      { key: 'data-performance', label: 'Hiệu quả hoạt động', path: '/admin/data/performance' },
    ],
  }
];

const pathKeyMap = new Map<string, { childKey: string; parentKey: string }>();
MENU_CONFIG.forEach(parent => {
  if (parent.children) {
    parent.children.forEach(child => {
      if (child.path) {
        pathKeyMap.set(child.path, { childKey: child.key, parentKey: parent.key });
      }
    });
  }
});

const AdminSider: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const activeKeys = useMemo(() => {
    const match = pathKeyMap.get(location.pathname);
    if (match) {
      return {
        selected: [match.childKey],
        open: [match.parentKey],
      };
    }
    return { selected: ['overview-customer'], open: ['overview'] };
  }, [location.pathname]);

  useEffect(() => {
    setOpenKeys(activeKeys.open);
  }, [activeKeys.open]);

  const menuItems = useMemo(() => {
    return MENU_CONFIG.map(item => ({
      ...item,
      label: <span className="font-semibold">{item.label}</span>,
      icon: item.icon ? <item.icon /> : null,
      children: item.children?.map(child => ({
        ...child,
        label: child.label,
      })),
    }));
  }, []);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    for (const parent of MENU_CONFIG) {
      const child = parent.children?.find(c => c.key === key);
      if (child && child.path) {
        navigate(child.path);
        break;
      }
    }
  };

  return (
    <Sider
      width={260}
      breakpoint="lg"
      collapsedWidth={0}
      className="!sticky !top-0 !left-0 !h-screen !overflow-auto border-r border-white/10 !bg-gradient-to-b !from-indigo-700 !to-indigo-500 text-white"
    >
      <div className="px-5 pt-4 pb-2 text-base font-bold text-white">
        Trung tâm điều khiển
      </div>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={activeKeys.selected}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        items={menuItems}
        onClick={handleMenuClick}
        className="!border-r-0 !bg-transparent px-2 text-white
          [&_.ant-menu-sub]:!bg-transparent
          [&_.ant-menu-item]:m-0 [&_.ant-menu-item]:w-full [&_.ant-menu-item]:rounded-md
          [&_.ant-menu-item-selected]:!bg-white/20
          [&_.ant-menu-item:hover]:!bg-white/10
          [&_.ant-menu-item-selected_span]:!text-white
          [&_.ant-menu-item_span]:text-white/80"
      />
    </Sider>
  );
};

export default AdminSider;