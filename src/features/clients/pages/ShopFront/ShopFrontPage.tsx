import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Skeleton, Button, Result } from 'antd';
import { ArrowLeftOutlined, ShopOutlined } from '@ant-design/icons';
import { useGetPublicShopThemeQuery } from '@/stores/api/shopApi.slice';
import ShopThemeProvider from './providers/ShopThemeProvider';
import DynamicRenderer from './components/DynamicRenderer';

const ShopFrontPageContent: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();

  const {
    data: themeResponse,
    isLoading,
    isError,
  } = useGetPublicShopThemeQuery(shopId!, {
    skip: !shopId,
  });

  const theme = themeResponse?.result;

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
        <Skeleton.Input active block style={{ height: 48, marginBottom: 16 }} />
        <Skeleton.Image active style={{ width: '100%', height: 360, borderRadius: 12 }} />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton.Image key={i} active style={{ width: '100%', height: 240, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error / No theme ---------- */
  if (isError || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Result
          icon={<ShopOutlined className="text-slate-300" />}
          title="Cửa hàng chưa có giao diện"
          subTitle="Chủ cửa hàng đang thiết lập giao diện. Vui lòng quay lại sau."
          extra={
            <Link to="/">
              <Button type="primary" icon={<ArrowLeftOutlined />} size="large">
                Về trang chủ
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* ---------- Theme loaded ---------- */
  const { primaryColor, secondaryColor, fontFamily, layoutConfig } = theme;
  const blocks = layoutConfig?.sections ?? [];

  return (
    <ShopThemeProvider
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      fontFamily={fontFamily}
    >
      {/* Shop header bar */}
      <header
        className="sticky top-0 z-50 text-white shadow-md"
        style={{ backgroundColor: 'var(--shop-primary)' }}
      >
        <div
          className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between"
          style={{ fontFamily: 'var(--shop-font)' }}
        >
          <Link to="/" className="text-white/80 hover:text-white transition-colors">
            <ArrowLeftOutlined className="mr-2" />
            Quay lại
          </Link>
          <span className="font-bold text-lg tracking-wide">MyShop</span>
          <div className="w-16" />
        </div>
      </header>

      {/* Block content */}
      <main className="flex-1" style={{ backgroundColor: 'var(--shop-secondary)' }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <DynamicRenderer blocks={blocks} />
        </div>
      </main>

      {/* Shop footer */}
      <footer className="text-center text-xs py-6" style={{ backgroundColor: '#333', color: '#999' }}>
        © {new Date().getFullYear()} MyShop — Powered by Cellex
      </footer>
    </ShopThemeProvider>
  );
};

const ShopFrontPage: React.FC = () => <ShopFrontPageContent />;

export default ShopFrontPage;
