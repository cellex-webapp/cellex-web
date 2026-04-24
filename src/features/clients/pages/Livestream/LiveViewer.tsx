import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Drawer, Badge, message, Tag } from 'antd';
import {
  ShoppingCartOutlined,
  FireFilled,
  CloseOutlined,
  HomeOutlined,
  TagOutlined,
  ThunderboltFilled,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useLivestream } from '@/hooks/useLivestream';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { wsService } from '@/services/websocket';
import { useAppDispatch } from '@/hooks/redux';
import { fetchProductById } from '@/stores/slices/product.slice';
import orderService from '@/services/order.service';

const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80';

const getProductImage = (product: ILivestreamProduct | null) => {
  const firstImage = product?.images?.[0];
  if (typeof firstImage === 'string') return firstImage;
  return PLACEHOLDER_IMAGE;
};

const getProductPriceLabel = (product: ILivestreamProduct | null) => {
  const value = product?.finalPrice ?? product?.price;
  if (typeof value !== 'number') return 'Liên hệ';
  return `${value.toLocaleString()}đ`;
};

const getOriginalPriceLabel = (product: ILivestreamProduct | null) => {
  if (product?.finalPrice && product?.price && product.finalPrice < product.price) {
    return `${product.price.toLocaleString()}đ`;
  }
  return null;
};

const getDiscountPercent = (product: ILivestreamProduct | null) => {
  if (product?.finalPrice && product?.price && product.finalPrice < product.price) {
    return Math.round((1 - product.finalPrice / product.price) * 100);
  }
  return null;
};

/* ─── Loading Screen ─── */
const LoadingScreen: React.FC = () => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
    {/* Pulsing live dot */}
    <div className="relative mb-8">
      <div className="w-20 h-20 rounded-full border-2 border-red-500/30 animate-ping absolute inset-0" />
      <div className="w-20 h-20 rounded-full border-2 border-red-500/60 animate-ping absolute inset-0 delay-150" />
      <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center relative">
        <FireFilled className="text-red-400 text-3xl" />
      </div>
    </div>
    <p className="text-white font-bold text-xl tracking-wide mb-2">Đang kết nối</p>
    <p className="text-gray-400 text-sm">Vui lòng chờ trong giây lát...</p>
    <div className="flex gap-1.5 mt-5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-red-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

/* ─── Live Badge ─── */
const LiveBadge: React.FC = () => (
  <div className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg shadow-red-900/50">
    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
    LIVE
  </div>
);

/* ─── Pinned Product Card ─── */
interface PinnedProductCardProps {
  product: ILivestreamProduct;
  onClose: () => void;
  onBuyNow: (id: string) => void;
}
const PinnedProductCard: React.FC<PinnedProductCardProps> = ({ product, onClose, onBuyNow }) => {
  const discount = getDiscountPercent(product);
  const originalPrice = getOriginalPriceLabel(product);

  return (
    <div
      className="pointer-events-auto w-[280px] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(20,20,30,0.97) 0%, rgba(30,20,35,0.97) 100%)',
        backdropFilter: 'blur(20px)',
        animation: 'slideUpFade 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-red-400 text-[11px] font-bold tracking-wider uppercase">Sản phẩm nổi bật</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 transition-colors p-0.5 rounded-md hover:bg-white/10"
        >
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      </div>

      {/* Body */}
      <div className="flex gap-3 p-3">
        <div className="relative flex-shrink-0">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="w-[72px] h-[72px] object-cover rounded-xl border border-white/10"
          />
          {discount && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
              -{discount}%
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h4 className="text-white text-[13px] font-semibold line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-red-400 font-black text-base">{getProductPriceLabel(product)}</span>
            {originalPrice && (
              <span className="text-gray-500 text-xs line-through">{originalPrice}</span>
            )}
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onBuyNow(product.productId)}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          style={{
            background: 'linear-gradient(90deg, #e11d48, #f97316)',
            boxShadow: '0 4px 15px rgba(225,29,72,0.45)',
          }}
        >
          <ThunderboltFilled />
          MUA NGAY
          <ArrowRightOutlined style={{ fontSize: 11 }} />
        </button>
      </div>
    </div>
  );
};

/* ─── Drawer Product Item ─── */
interface DrawerProductItemProps {
  product: ILivestreamProduct;
  onAddToCart: (id: string) => void;
  onBuyNow: (id: string) => void;
}
const DrawerProductItem: React.FC<DrawerProductItemProps> = ({ product, onAddToCart, onBuyNow }) => {
  const discount = getDiscountPercent(product);
  const originalPrice = getOriginalPriceLabel(product);

  return (
    <div className="flex gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-150">
      {/* Image */}
      <div className="relative flex-shrink-0">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-20 h-20 rounded-xl object-cover border border-gray-200"
        />
        {discount && (
          <Tag
            color="red"
            className="absolute -top-2 -right-2 !text-[9px] !font-black !px-1 !py-0 !rounded-full !leading-4 !m-0"
          >
            -{discount}%
          </Tag>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <h5 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">{product.name}</h5>
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-red-500 font-black text-base">{getProductPriceLabel(product)}</span>
            {originalPrice && (
              <span className="text-gray-400 text-xs line-through">{originalPrice}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAddToCart(product.productId)}
              className="flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition-colors duration-150 flex items-center justify-center gap-1"
            >
              <ShoppingCartOutlined /> Thêm giỏ
            </button>
            <button
              onClick={() => onBuyNow(product.productId)}
              className="flex-1 text-xs font-bold py-1.5 px-2 rounded-lg text-white transition-all duration-150 active:scale-95"
              style={{ background: 'linear-gradient(90deg, #e11d48, #f97316)' }}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const LiveViewer: React.FC = () => {
  const { sessionId, roomId } = useParams<{ sessionId: string; roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const containerRef = useRef<HTMLDivElement>(null);
  const { fetchViewerToken, fetchSessionProducts, sessionProducts, clearSession } = useLivestream();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const isJoinedRef = useRef(false);

  const [isBagOpen, setIsBagOpen] = useState(false);
  const [pinnedProduct, setPinnedProduct] = useState<ILivestreamProduct | null>(null);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart({ productId, quantity: 1 });
      message.success('Đã thêm vào giỏ hàng!');
    } catch (error: any) {
      message.error(error?.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async (productId: string) => {
    try {
      const response = await orderService.createOrderFromProduct({
        items: [{ productId, quantity: 1 }],
      });
      const order = response.result as IOrder;
      if (!order?.id) throw new Error('Không tạo được đơn hàng');
      setIsBagOpen(false);
      navigate(`/order/confirm/${order.id}`);
    } catch (error: any) {
      message.error(error?.message || 'Không thể chuyển đến trang checkout');
    }
  };

  // WebSocket
  useEffect(() => {
    if (!sessionId) return;
    wsService.connect((event: any) => {
      if (event.type === 'PIN_PRODUCT') {
        // event.productId = productId thật, event.livestreamProductId = id join-table
        dispatch(fetchProductById(event.productId))
          .unwrap()
          .then((prod) => {
            const pinned: ILivestreamProduct = {
              id: event.livestreamProductId ?? prod.id,
              productId: prod.id,
              name: prod.name,
              price: prod.price,
              finalPrice: prod.finalPrice,
              saleOff: prod.saleOff,
              images: prod.images,
              stockQuantity: prod.stockQuantity,
              averageRating: prod.averageRating,
            };
            setPinnedProduct(pinned);
          });
      } else if (event.type === 'UNPIN_PRODUCT') {
        setPinnedProduct(null);
      }
    });
    setTimeout(() => wsService.subscribeLiveEvents(sessionId), 1000);
    return () => wsService.disconnect();
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (!sessionId) return;
    fetchSessionProducts(sessionId).catch(() => {});
  }, [sessionId, fetchSessionProducts]);

  // ZegoCloud
  useEffect(() => {
    if (!currentUser?.id || isJoinedRef.current) return;
    let zp: ZegoUIKitPrebuilt | null = null;

    const initZegoCloud = async () => {
      if (!containerRef.current || !sessionId || !roomId) return;
      try {
        setIsInitializing(true);
        isJoinedRef.current = true;
        const token = await fetchViewerToken(sessionId);
        if (!token) throw new Error('Không lấy được token xác thực từ máy chủ.');
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          ZEGO_APP_ID,
          token,
          roomId,
          currentUser?.id.toString() || `viewer_${Date.now()}`,
          currentUser?.fullName || 'Khán giả',
        );
        zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: { role: ZegoUIKitPrebuilt.Audience },
          },
          showPreJoinView: false,
          onLeaveRoom: () => navigate('/livestreams'),
        });
      } catch (err: any) {
        console.error('Lỗi khởi tạo ZegoCloud:', err);
        setInitError(err.message || 'Không thể kết nối vào phòng Live lúc này.');
        isJoinedRef.current = false;
      } finally {
        setIsInitializing(false);
      }
    };

    initZegoCloud();
    return () => {
      if (zp) zp.destroy();
      isJoinedRef.current = false;
      clearSession();
    };
  }, [sessionId, roomId, currentUser?.id]);

  /* ── Error Screen ── */
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <FireFilled className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Không thể kết nối</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{initError}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-150 active:scale-95"
            style={{ background: 'linear-gradient(90deg,#e11d48,#f97316)' }}
          >
            <HomeOutlined /> Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* Loading Overlay */}
      {isInitializing && <LoadingScreen />}

      {/* Zego Video Layer */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Overlay UI (pointer-events-none wrapper) ── */}
      <div className="absolute inset-0 z-40 pointer-events-none">

        {/* Top bar: LIVE badge */}
        <div className="absolute top-4 left-4 pointer-events-auto flex items-center gap-2">
          <LiveBadge />
        </div>

        {/* Bottom-left: Pinned Product */}
        <div className="absolute bottom-24 left-4 md:bottom-10 md:left-5 flex flex-col items-start gap-3">
          {pinnedProduct && (
            <PinnedProductCard
              product={pinnedProduct}
              onClose={() => setPinnedProduct(null)}
              onBuyNow={handleBuyNow}
            />
          )}
        </div>

        {/* Bottom-right: Cart button */}
        <div
          className="absolute bottom-24 right-4 md:bottom-10 md:right-5 pointer-events-auto flex flex-col items-center gap-2"
          style={{ animation: 'bounceIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.8s both' }}
        >
          <Badge
            count={sessionProducts.length}
            color="#e11d48"
            offset={[4, 4]}
            style={{ fontWeight: 700 }}
          >
            <button
              onClick={() => setIsBagOpen(true)}
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-90 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg,rgba(20,20,30,0.95),rgba(30,25,40,0.95))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <ShoppingCartOutlined className="text-white text-xl" />
              <span className="text-white/60 text-[9px] font-medium">Mua hàng</span>
            </button>
          </Badge>
        </div>

      </div>

      {/* ── Drawer: Live Shop ── */}
      <Drawer
        open={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        placement="bottom"
        height="75vh"
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            padding: '14px 20px',
          },
          body: { padding: '12px 16px', overflowY: 'auto' },
          wrapper: { borderRadius: '20px 20px 0 0', overflow: 'hidden' },
        }}
        title={
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#e11d48,#f97316)' }}
            >
              <TagOutlined className="text-white text-sm" />
            </div>
            <div>
              <p className="font-black text-base text-gray-900 leading-tight">Live Shop</p>
              <p className="text-gray-400 text-xs font-normal leading-tight">
                {sessionProducts.length} sản phẩm trong phiên
              </p>
            </div>
          </div>
        }
        closeIcon={
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <CloseOutlined style={{ fontSize: 12 }} />
          </div>
        }
      >
        {sessionProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingCartOutlined className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">Chưa có sản phẩm nào</p>
            <p className="text-gray-400 text-xs mt-1">Sản phẩm sẽ xuất hiện khi streamer giới thiệu</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessionProducts.map((product) => (
              <DrawerProductItem
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default LiveViewer;
