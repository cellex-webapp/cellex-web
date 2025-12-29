import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useChat } from '@/hooks/useChat';
import logo from '@/assets/logo/cellex.png';
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, BellOutlined, MessageOutlined, AudioOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import { CategoryMegaMenu } from '@/features/clients/components/Category/CategoryMegaMenu';
import { useCart } from '@/hooks/useCart';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

interface HeaderProps {
  hideSearchBar?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideSearchBar = false }) => {
  const [q, setQ] = useState('');
  const [submitTimeout, setSubmitTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { isAuthenticated } = useAuth();
  const { totalItems, fetchMyCart } = useCart();
  const { unreadCount, getUnreadCount } = useNotification();
  const { totalUnread: totalUnreadMessages, initChat } = useChat();
  const { isListening, transcript, interimTranscript, startListening, stopListening, isSupported } = useVoiceSearch('vi-VN');

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCart();
      getUnreadCount();
      initChat(); // Initialize chat to get unread message count
    }
  }, [isAuthenticated, fetchMyCart, getUnreadCount, initChat]);

  // Sync search query from URL
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQ(queryParam);
    } else {
      setQ('');
    }
  }, [searchParams, location.pathname]);

  // Handle voice search transcript
  useEffect(() => {
    if (transcript) {
      setQ(transcript);
    }
  }, [transcript]);

  // Show interim results in real-time
  useEffect(() => {
    if (isListening && interimTranscript) {
      setQ(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  // Auto-submit when voice recognition stops with delay
  useEffect(() => {
    // Clear any existing timeout
    if (submitTimeout) {
      clearTimeout(submitTimeout);
    }

    if (!isListening && transcript && transcript.trim().length > 2) {
      // Wait 500ms after recognition stops before submitting
      const timeout = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
      }, 500);
      setSubmitTimeout(timeout);
    }

    return () => {
      if (submitTimeout) {
        clearTimeout(submitTimeout);
      }
    };
  }, [isListening, transcript, navigate]);

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      setQ(''); // Clear input when starting voice search
      startListening();
    }
  };

  return (
    <header className="w-full fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20">
      <div className="h-16 md:h-18 lg:h-18 flex items-center px-4 md:px-8 gap-4 md:gap-6 lg:gap-10">
        <div className="flex items-center min-w-fit">
          <Link to="/" className="flex items-center">
            <img src={logo} className="h-8 md:h-10 lg:h-8 w-auto object-contain" />
          </Link>
          <span className="ml-2 hidden sm:inline text-lg md:text-xl font-bold tracking-wide text-indigo-600">
            CELLEX
          </span>
        </div>

        {isAuthenticated && <CategoryMegaMenu />}

        {isAuthenticated && !hideSearchBar && (
        <div className="hidden sm:flex items-center flex-1 max-w-[520px] md:max-w-[600px] ml-4 md:ml-8 rounded-lg border border-gray-300 bg-white">
          <form onSubmit={onSearch} className="flex items-center w-full px-3 md:px-4 h-9 md:h-10 gap-2">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isListening ? 'Đang lắng nghe...' : 'Tìm trong trang...'}
              className={`flex-1 bg-transparent outline-none text-[14px] md:text-[15px] ${isListening ? 'placeholder:text-red-400' : 'placeholder:text-gray-400'}`}
              disabled={isListening}
            />
            {isSupported && (
              <button
                type="button"
                onClick={toggleVoiceSearch}
                aria-label={isListening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
                className={`transition-all duration-300 ${
                  isListening
                    ? 'text-red-500 animate-pulse'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <AudioOutlined className="text-base md:text-lg" />
              </button>
            )}
            <button type="submit" aria-label="Tìm kiếm" className="text-gray-500 hover:text-gray-700">
              <SearchOutlined className="text-base md:text-lg" />
            </button>
          </form>
        </div>
        )}

        <div className="flex items-center gap-3 text-sm ml-auto">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <Badge count={totalUnreadMessages} overflowCount={99} offset={[-2, 6]}>
                  <button
                    type="button"
                    aria-label="Tin nhắn"
                    onClick={() => navigate('/account?tab=messages#messages')}
                    className="p-3 rounded-full bg-indigo-600 !text-white hover:brightness-90 cursor-pointer"
                  >
                    <MessageOutlined className="text-sm md:text-lg" />
                  </button>
                </Badge>

                <Badge count={unreadCount} overflowCount={99} offset={[-2, 6]}>
                  <button
                    type="button"
                    aria-label="Thông báo"
                    onClick={() => navigate('/account?tab=notifications#notifications')}
                    className="p-3 rounded-full bg-indigo-600 !text-white hover:brightness-90 cursor-pointer"
                  >
                    <BellOutlined className="text-sm md:text-lg" />
                  </button>
                </Badge>

                <Link to="/account" className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-50 hover:bg-indigo-100 no-underline !cursor-pointer">
                  <UserOutlined className="text-indigo-600 text-sm md:text-lg" />
                </Link>

                <Link to="/cart" className="no-underline">
                  <Badge count={totalItems} offset={[-6, 8]}>
                    <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 md:px-4 md:py-3 rounded-full">
                      <ShoppingCartOutlined className="text-lg md:text-2xl" />
                      <span className="hidden sm:inline md:inline">Giỏ hàng</span>
                    </div>
                  </Badge>
                </Link>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold !rounded !bg-indigo-600 !text-white hover:!bg-indigo-700 flex items-center justify-center no-underline min-w-[40px]"
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