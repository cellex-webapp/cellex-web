import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Spin, Button, Result } from 'antd';
import { useLivestream } from '@/hooks/useLivestream';
import { useAuth } from '@/hooks/useAuth'; 

const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);

const LiveViewer: React.FC = () => {
  const { sessionId, roomId } = useParams<{ sessionId: string; roomId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { fetchViewerToken, clearSession } = useLivestream();
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { currentUser } = useAuth();
  const isJoinedRef = useRef(false);

  useEffect(() => {
    // 1. Kiểm tra: Nếu chưa có user hoặc ĐÃ VÀO PHÒNG RỒI thì dừng lại ngay!
    if (!currentUser?.id || isJoinedRef.current) return;

    let zp: ZegoUIKitPrebuilt | null = null;

    const initZegoCloud = async () => {
      if (!containerRef.current || !sessionId || !roomId) return;

      try {
        setIsInitializing(true);
        // Đánh dấu là đã bắt đầu quá trình vào phòng
        isJoinedRef.current = true;

        const token = await fetchViewerToken(sessionId);
        if (!token) throw new Error("Không lấy được token xác thực từ máy chủ.");

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          ZEGO_APP_ID,
          token,
          roomId,
          currentUser?.id.toString() || `user_${Date.now()}`,
          currentUser?.fullName
        );

        zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: { role: ZegoUIKitPrebuilt.Audience },
          },
          showPreJoinView: false,
          onLeaveRoom: () => { navigate('/'); },
        });

      } catch (err: any) {
        console.error("Lỗi khởi tạo ZegoCloud:", err);
        setInitError(err.message || "Không thể kết nối vào phòng Live lúc này.");
        // Nếu lỗi thì mở chốt cho phép thử lại
        isJoinedRef.current = false; 
      } finally {
        setIsInitializing(false);
      }
    };

    initZegoCloud();

    // 2. CLEANUP FUNCTION: Xóa dấu vết khi người dùng back ra ngoài
    return () => {
      if (zp) {
        zp.destroy();
      }
      isJoinedRef.current = false; // Reset lính gác
      clearSession();
    };
  }, [sessionId, roomId, currentUser?.id]);

  // UI khi có lỗi
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Result
          status="500"
          title="Lỗi Kết Nối"
          subTitle={initError}
          extra={<Button type="primary" onClick={() => navigate('/')}>Về trang chủ</Button>}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black relative flex flex-col">
      {/* Loading overlay khi đang xin token và khởi tạo */}
      {isInitializing && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white">
          <Spin size="large" />
          <p className="mt-4 text-lg">Đang kết nối vào phòng Live...</p>
        </div>
      )}

      {/* Container bắt buộc phải có chiều cao và chiều rộng để Zego vẽ Video */}
      <div 
        ref={containerRef} 
        className="w-full h-full flex-1" 
      />
    </div>
  );
};

export default LiveViewer;