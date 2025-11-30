import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo/cellex.png';
import { UserOutlined, BellOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import { useNotification } from '@/hooks/useNotification';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const { isAuthenticated, currentUser, logout } = useAuth();
  const { unreadCount } = useNotification();

  const targetPath = useMemo(() => {
    const roles = (currentUser?.role || []) as string[];
    if (roles.includes('ADMIN')) return '/admin/notifications';
    if (roles.includes('VENDOR')) return '/vendor/notifications';
    return '/account?tab=notifications';
  }, [currentUser]);

  const handleLogout = async () => {
    await logout(); 
    navigate('/login', { replace: true });
  };

  return (
    <header className="w-full fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20">
      <div className="h-14 flex items-center px-4 md:px-8 gap-4 md:gap-6 lg:gap-10">
        <div className="flex items-center min-w-fit">
          <Link to="/" className="flex items-center">
            <img src={logo} className="h-8 md:h-10 lg:h-8 w-auto object-contain" />
          </Link>
          <span className="ml-2 hidden sm:inline text-lg md:text-xl font-bold tracking-wide text-indigo-600">
            CELLEX
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm ml-auto">
          {isAuthenticated ? (
            <>
              <Link to={targetPath} className="flex items-center">
                <Badge count={unreadCount} size="small">
                  <BellOutlined className="text-xl text-gray-700" />
                </Badge>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-gray-700">
                <UserOutlined />
                <span className="truncate max-w-[160px]" title={currentUser?.email}>
                  {currentUser?.email}
                </span>
              </div>
              <button
                onClick={handleLogout} 
                className="px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold !rounded !bg-indigo-600 !text-white hover:!bg-indigo-700 flex items-center justify-center no-underline min-w-[40px] cursor-pointer"
              >
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center no-underline min-w-[40px]"
              title="Đăng nhập"
            >
              <span className="hidden md:inline">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;