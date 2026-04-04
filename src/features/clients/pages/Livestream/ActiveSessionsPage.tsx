import React, { useEffect } from 'react';
import { Card, Spin, Empty, Alert, Button, Badge } from 'antd';
import { PlayCircleOutlined, ReloadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLivestream } from '@/hooks/useLivestream';

const ActiveSessionsPage: React.FC = () => {
  const { activeSessions, isLoading, error, fetchActiveSessions } = useLivestream();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <VideoCameraOutlined className="text-red-500" />
          Livestream Đang Diễn Ra
        </h1>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchActiveSessions} 
          loading={isLoading}
        >
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert message="Không thể tải danh sách" description={error} type="error" showIcon className="mb-6" />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" tip="Đang tìm các phiên Live..." />
        </div>
      ) : activeSessions.length === 0 && !error ? (
        <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-lg border border-gray-100 shadow-sm">
          <Empty description="Hiện tại không có Shop nào đang phát sóng" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeSessions.map((session) => (
            <Badge.Ribbon text="ĐANG LIVE" color="red" key={session.id}>
              <Card
                hoverable
                cover={
                  <div className="relative aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
                    {session.thumbnail ? (
                       <img alt={session.title} src={session.thumbnail} className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                       <PlayCircleOutlined className="text-4xl text-gray-600" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                       <PlayCircleOutlined className="text-5xl text-white" />
                    </div>
                  </div>
                }
                // Khi click, chuyển hướng user tới trang có chứa mã nhúng ZegoCloud
                onClick={() => navigate(`/live-viewer/${session.id}/${session.roomId}`)}
                className="overflow-hidden border border-gray-200"
                bodyStyle={{ padding: '16px' }}
              >
                <Card.Meta
                  title={<span className="font-bold text-lg line-clamp-1">{session.title}</span>}
                  description={
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {session.vendorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-600 font-medium">{session.vendorName}</span>
                    </div>
                  }
                />
              </Card>
            </Badge.Ribbon>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveSessionsPage;