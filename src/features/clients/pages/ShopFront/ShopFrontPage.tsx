import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetPublicShopThemeQuery } from '@/stores/api/shopApi.slice';
import useShop from '@/hooks/useShop';
import ShopCard from '@/features/clients/components/Shop/ShopCard';
import ProductByShop from '@/features/clients/pages/Product/ProductByShop';
import ShopThemeProvider from './providers/ShopThemeProvider';
import DynamicRenderer from './components/DynamicRenderer';

const ShopFrontPageContent: React.FC<{ shopId: string }> = ({ shopId }) => {
  const { shop: shopData, fetchShopById } = useShop();

  useEffect(() => {
    fetchShopById(shopId);
  }, [shopId, fetchShopById]);

  const {
    data: themeResponse,
    isLoading,
    isError,
  } = useGetPublicShopThemeQuery(shopId);

  const theme = themeResponse?.result;
  const shopName = shopData?.shop_name ?? 'MyShop';

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

  /* ---------- No theme — fallback to ShopCard + ProductByShop ---------- */
  if (isError || !theme) {
    return (
      <div className="max-w-6xl mx-auto py-6 space-y-6">
        <ShopCard shopId={shopId} showViewLink={false} />
        <ProductByShop />
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
          <span className="font-bold text-lg tracking-wide">{shopName}</span>
          <div className="w-16" />
        </div>
      </header>

      {/* Block content */}
      <main className="flex-1" style={{ backgroundColor: 'var(--shop-secondary)' }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <DynamicRenderer blocks={blocks} shopId={shopId} />
        </div>
        <ProductByShop hideShopCard />
      </main>
    </ShopThemeProvider>
  );
};

const ShopFrontPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  if (!shopId) return null;
  return <ShopFrontPageContent key={shopId} shopId={shopId} />;
};

export default ShopFrontPage;
