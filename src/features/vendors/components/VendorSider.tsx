import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
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

const MENU_CONFIG = [
  {
    key: 'order',
    label: 'Quản lý đơn hàng',
    icon: AppstoreOutlined,
    children: [
      { key: 'order-all', label: 'Tất cả', path: '/vendor/orders' },
      { key: 'order-shipping', label: 'Đơn vị vận chuyển', path: '/vendor/orders/shipping' },
    ],
  },
  {
    key: 'product',
    label: 'Quản lý Sản phẩm',
    icon: ShopOutlined,
    children: [
      { key: 'product-all', label: 'Tất cả sản phẩm', path: '/vendor/products' },
      { key: 'product-add', label: 'Tạo sản phẩm', path: '/vendor/products/create' },
      { key: 'product-category', label: 'Danh mục sản phẩm', path: '/vendor/categories' },
    ],
  },
  {
    key: 'marketing',
    label: 'Kênh Marketing',
    icon: TagsOutlined,
    children: [
      { key: 'marketing-coupon', label: 'Khuyến mãi của tôi', path: '/vendor/marketing/coupons' },
      { key: 'marketing-system', label: 'Khuyến mãi hệ thống', path: '/vendor/marketing/system' },
    ],
  },
  {
    key: 'customer',
    label: 'Chăm sóc Khách hàng',
    icon: CustomerServiceOutlined,
    children: [
      { key: 'customer-message', label: 'Quản lý tin nhắn', path: '/vendor/customers/messages' },
      { key: 'customer-rating', label: 'Quản lý đánh giá', path: '/vendor/customers/ratings' },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    icon: DollarOutlined,
    children: [
      { key: 'finance-revenue', label: 'Doanh thu', path: '/vendor/finance/revenue' },
    ],
  },
  {
    key: 'data',
    label: 'Dữ liệu',
    icon: DatabaseOutlined,
    children: [
      { key: 'data-analytics', label: 'Phân tích bán hàng', path: '/vendor/data/analytics' },
    ],
  },
  {
    key: 'shop',
    label: 'Quản lý Shop',
    icon: TeamOutlined,
    children: [
      { key: 'shop-profile', label: 'Hồ sơ shop', path: '/vendor/shop' },
    ],
  },
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

const VendorSider: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const activeKeys = useMemo(() => {
    const match = pathKeyMap.get(location.pathname);
    if (match) {
      return { selected: [match.childKey], open: [match.parentKey] };
    }
    return { selected: ['order-all'], open: ['order'] };
  }, [location.pathname]);

  useEffect(() => { setOpenKeys(activeKeys.open); }, [activeKeys.open]);

  const menuItems = useMemo(() => {
    return MENU_CONFIG.map(item => ({
      ...item,
      label: <span className="font-semibold">{item.label}</span>,
      icon: item.icon ? <item.icon /> : null,
      children: item.children?.map(child => ({ ...child, label: child.label })),
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
      <div className="px-5 pt-4 pb-2 text-base font-bold text-white">Trung tâm điều khiển</div>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={activeKeys.selected}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        items={menuItems as any}
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

export default VendorSider;
