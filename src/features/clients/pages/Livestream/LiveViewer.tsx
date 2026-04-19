import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Spin, Button, Result, Drawer, Badge, message } from 'antd';
import { ShoppingCartOutlined, FireFilled, CloseOutlined } from '@ant-design/icons';
import { useLivestream } from '@/hooks/useLivestream';
import { useAuth } from '@/hooks/useAuth';
import { wsService } from '@/services/websocket';
import { useAppDispatch } from '@/hooks/redux';
import { fetchProductById } from '@/stores/slices/product.slice'; // Để lấy data thật khi ghim
import orderService from '@/services/order.service';

const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80';

const getProductImage = (product: IProduct | null) => {
  const firstImage = product?.images?.[0];
  if (typeof firstImage === 'string') return firstImage;
  return PLACEHOLDER_IMAGE;
};

const getProductPriceLabel = (product: IProduct | null) => {
  const value = product?.finalPrice ?? product?.price;
  if (typeof value !== 'number') return 'Liên hệ';
  return `${value.toLocaleString()}đ`;
};

const LiveViewer: React.FC = () => {
  const { sessionId, roomId } = useParams<{ sessionId: string; roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { fetchViewerToken, fetchSessionProducts, sessionProducts, clearSession } = useLivestream();
  const { currentUser } = useAuth();
  
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const isJoinedRef = useRef(false);

  // --- STATE CHO UI MUA HÀNG ---
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [pinnedProduct, setPinnedProduct] = useState<IProduct | null>(null);

  const handleAddAndCheckout = async (productId: string) => {
    try {
      const response = await orderService.createOrderFromProduct({
        items: [{ productId, quantity: 1 }],
      });
      const order = response.result as IOrder;

      if (!order?.id) {
        throw new Error('Không tạo được đơn hàng');
      }

      setIsBagOpen(false);
      navigate(`/order/confirm/${order.id}`);
    } catch (error: any) {
      message.error(error?.message || 'Không thể chuyển đến trang checkout');
    }
  };

  // 1. Lắng nghe WebSocket
  useEffect(() => {
    if (!sessionId) return;

    wsService.connect((event: any) => {
      if (event.type === 'PIN_PRODUCT') {
        // Gọi Redux fetch data thật của sản phẩm vừa ghim
        dispatch(fetchProductById(event.productId)).unwrap().then((prod) => {
          setPinnedProduct(prod);
        });
      } else if (event.type === 'UNPIN_PRODUCT') {
        setPinnedProduct(null);
      }
    });

    // Đợi 1 chút cho WS connect xong rồi subscribe
    setTimeout(() => {
      wsService.subscribeLiveEvents(sessionId);
    }, 1000);

    return () => {
      wsService.disconnect();
    };
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (!sessionId) return;

    fetchSessionProducts(sessionId).catch(() => {
      // Lỗi đã được quản lý ở livestream slice
    });
  }, [sessionId, fetchSessionProducts]);

  // 2. Khởi tạo ZegoCloud
  useEffect(() => {
    if (!currentUser?.id || isJoinedRef.current) return;

    let zp: ZegoUIKitPrebuilt | null = null;

    const initZegoCloud = async () => {
      if (!containerRef.current || !sessionId || !roomId) return;

      try {
        setIsInitializing(true);
        isJoinedRef.current = true;

        const token = await fetchViewerToken(sessionId);
        if (!token) throw new Error("Không lấy được token xác thực từ máy chủ.");

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          ZEGO_APP_ID, token, roomId, 
          currentUser?.id.toString() || `viewer_${Date.now()}`,
          currentUser?.fullName || "Khán giả"
        );

        zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: { role: ZegoUIKitPrebuilt.Audience },
          },
          showPreJoinView: false,
          onLeaveRoom: () => { navigate('/livestreams'); },
        });

      } catch (err: any) {
        console.error("Lỗi khởi tạo ZegoCloud:", err);
        setInitError(err.message || "Không thể kết nối vào phòng Live lúc này.");
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

  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Result status="500" title="Lỗi Kết Nối" subTitle={initError} extra={<Button type="primary" onClick={() => navigate('/')}>Về trang chủ</Button>} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black relative flex flex-col overflow-hidden">
      {/* Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white">
          <Spin size="large" />
          <p className="mt-4 text-lg">Đang kết nối vào phòng Live...</p>
        </div>
      )}

      {/* Zego Video Player (Lớp dưới cùng) */}
      <div ref={containerRef} className="w-full h-full flex-1" />

      {/* ========================================================= */}
      {/* LỚP OVERLAY UI MUA HÀNG (Z-INDEX CAO HƠN ZEGO)            */}
      {/* pointer-events-none để không chặn thao tác vào Zego Video */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-end p-4 pb-20 md:pb-6">
        
        {/* KHU VỰC SẢN PHẨM GHIM (Góc dưới bên trái) */}
        {pinnedProduct && (
          <div className="pointer-events-auto w-72 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-red-100 mb-4 transform transition-all duration-500 hover:scale-105 animate-fade-in-up">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <FireFilled /> Đang Ghim
              </span>
              <button onClick={() => setPinnedProduct(null)} className="text-gray-400 hover:text-gray-600">
                <CloseOutlined />
              </button>
            </div>
            
            <div className="flex gap-3">
              <img 
                src={getProductImage(pinnedProduct)} 
                alt={pinnedProduct.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-100"
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{pinnedProduct.name}</h4>
                <p className="text-red-600 font-bold text-base">{getProductPriceLabel(pinnedProduct)}</p>
              </div>
            </div>
            <Button type="primary" danger className="w-full mt-3 font-bold shadow-md shadow-red-200" onClick={() => {/* Logic Thêm giỏ hàng Redux */}}>
              MUA NGAY
            </Button>
          </div>
        )}

        {/* NÚT MỞ GIỎ HÀNG LIVE (Góc dưới bên phải) */}
        <div className="pointer-events-auto absolute bottom-24 left-4 md:bottom-8 md:left-8">
          <Badge count={sessionProducts.length} offset={[5, 5]} color="#f5222d">
            <Button 
              type="primary" 
              shape="circle" 
              size="large" 
              className="w-14 h-14 bg-black/70 border-gray-600 shadow-xl backdrop-blur-md hover:bg-black/80 flex items-center justify-center"
              icon={<ShoppingCartOutlined className="text-2xl" />}
              onClick={() => setIsBagOpen(true)}
            />
          </Badge>
        </div>

      </div>

      {/* ========================================================= */}
      {/* DRAWER GIỎ HÀNG (Trượt từ phải sang hoặc dưới lên)        */}
      {/* ========================================================= */}
      <Drawer
        title={<span className="font-bold text-lg">Giỏ hàng Livestream</span>}
        placement="right"
        onClose={() => setIsBagOpen(false)}
        open={isBagOpen}
        width={380}
      >
        {/* Khu vực render danh sách sản phẩm. Map API GET /products ở đây */}
        <div className="flex flex-col gap-4">
          <p className="text-gray-500 text-sm">Sản phẩm trong phiên live này</p>

          {sessionProducts.length === 0 && (
            <p className="text-sm text-gray-400">Chưa có sản phẩm nào trong phiên live này.</p>
          )}

          {sessionProducts.map((product) => (
            <div key={product.id} className="flex gap-3 pb-4 border-b border-gray-100">
              <img src={getProductImage(product)} alt={product.name} className="w-20 h-20 rounded-md object-cover" />
              <div className="flex flex-col justify-between flex-1">
                <h5 className="font-semibold text-sm line-clamp-2">{product.name}</h5>
                <div className="flex justify-between items-end gap-2">
                  <span className="text-red-500 font-bold">{getProductPriceLabel(product)}</span>
                  <Button
                    size="small"
                    type="primary"
                    danger
                    ghost
                    onClick={() => handleAddAndCheckout(product.id)}
                  >
                    Thêm <ShoppingCartOutlined />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Drawer>

    </div>
  );
};

export default LiveViewer;