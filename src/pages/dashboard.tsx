import { useAuth } from '../hooks/useAuth'; 
import AdminPage from './admin/index';
import ClientPage from './client/index';
import VendorPage from './vendor/index';

const DashboardPage = () => {
  const { role } = useAuth(); 
  if (!role) {
    return <div>Đây là trang chủ công khai</div>;
  }

  switch (role) {
    case 'ADMIN':
      return <AdminPage />;
    case 'CLIENT':
      return <ClientPage />;
    case 'VENDOR':
      return <VendorPage />;
    default:
      return <div>Vai trò không hợp lệ hoặc trang không tồn tại.</div>;
  }
};

export default DashboardPage;