import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo/cellex.png';
import { SearchOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const { isAuthenticated, currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout(); 
    navigate('/login', { replace: true });
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    }
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

        <Link
          to="/categories"
          className="flex items-center gap-2 px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold !rounded-full !bg-indigo-600 !text-white hover:!bg-indigo-700 no-underline min-w-fit"
        >
          <MenuOutlined className="text-base md:text-lg" />
          <span className="hidden sm:inline">Danh mục</span>
        </Link>

        <div className="hidden sm:flex items-center flex-1 max-w-[520px] md:max-w-[600px] ml-4 md:ml-8 rounded-lg border border-gray-300 bg-white">
          <form onSubmit={onSearch} className="flex items-center w-full px-3 md:px-4 h-9 md:h-10">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm trong trang..."
              className="flex-1 bg-transparent outline-none text-[14px] md:text-[15px] placeholder:text-gray-400"
            />
            <button type="submit" aria-label="Tìm kiếm" className="text-gray-500 hover:text-gray-700">
              <SearchOutlined className="text-base md:text-lg" />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3 text-sm ml-auto">
          {isAuthenticated ? (
            <>
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