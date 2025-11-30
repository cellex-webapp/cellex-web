import React, { useEffect, useMemo, useState } from 'react';
import { Typography, Card, Space, Badge, Button, Input, Tabs, List, Tag, Popconfirm, Pagination } from 'antd';
import { useNotification } from '@/hooks/useNotification';

const { Title, Text } = Typography;

const TYPE_COLOR: Record<string, string> = {
  GENERAL: 'blue',
  SYSTEM: 'purple',
  PROMOTION: 'green',
};

const NotificationTab: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications(0, size);
    getUnreadCount();
  }, [fetchNotifications, getUnreadCount, size]);

  const filteredNotifications = useMemo(() => {
    const src = notifications || [];
    const applyTab = tab === 'UNREAD' ? src.filter(n => !n.isRead) : src;
    if (!query) return applyTab;
    const q = query.toLowerCase();
    return applyTab.filter(n => (n.title + ' ' + n.message).toLowerCase().includes(q));
  }, [notifications, query, tab]);

  const paginated = useMemo(() => {
    const start = page * size;
    return filteredNotifications.slice(start, start + size);
  }, [filteredNotifications, page, size]);

  return (
    <div id="notifications">
    <Space direction="vertical" size="large" className="w-full">
      <Card title={<Space><Title level={4} className="!mb-0">Trung tâm thông báo</Title>{unreadCount > 0 && <Badge count={unreadCount} />}</Space>}>
        <Space wrap className="w-full justify-between">
          <Space>
            <Button onClick={() => fetchNotifications(0, size)} loading={isLoading}>Làm mới</Button>
            <Button onClick={() => markAllAsRead()} disabled={unreadCount === 0} loading={isLoading}>Đánh dấu tất cả đã đọc</Button>
            <Button onClick={() => getUnreadCount()} loading={isLoading}>Cập nhật số chưa đọc</Button>
          </Space>
          <Input.Search allowClear placeholder="Tìm theo tiêu đề/nội dung" onSearch={setQuery} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 320 }} />
        </Space>
        {error && <Text type="danger" className="block mt-2">{error}</Text>}
        <Tabs activeKey={tab} onChange={(key) => setTab(key as any)} className="mt-3">
          <Tabs.TabPane tab={<Space> Tất cả <Badge count={notifications.length} /></Space>} key="ALL" />
          <Tabs.TabPane tab={<Space> Chưa đọc <Badge count={notifications.filter(n => !n.isRead).length} /></Space>} key="UNREAD" />
        </Tabs>
        <List
          className="mt-4"
          loading={isLoading}
          dataSource={paginated}
          bordered
          renderItem={(item) => (
            <List.Item id={`notification-${item.id}`}
              actions={[
                !item.isRead && <Button size="small" type="link" onClick={() => markAsRead(item.id)}>Đánh dấu đọc</Button>,
                <Popconfirm title="Xóa thông báo?" onConfirm={() => deleteNotification(item.id)}><Button danger size="small" type="link">Xóa</Button></Popconfirm>,
              ].filter(Boolean)}
            >
              <Space direction="vertical" size={0} className="w-full">
                <Space>
                  {!item.isRead && <Badge status="processing" />}
                  <Text strong>{item.title}</Text>
                  <Tag color={TYPE_COLOR[item.type] || 'default'}>{item.type}</Tag>
                </Space>
                <Text>{item.message}</Text>
                {item.actionUrl && (
                  <a href={item.actionUrl} target="_blank" rel="noreferrer" className="text-blue-600">Hành động</a>
                )}
                <Space size="small">
                  {item.createdAt && <Text type="secondary">Tạo: {new Date(item.createdAt).toLocaleString()}</Text>}
                  {item.readAt && <Text type="secondary">Đọc: {new Date(item.readAt).toLocaleString()}</Text>}
                </Space>
              </Space>
            </List.Item>
          )}
        />
        <div className="mt-3 flex justify-end">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={filteredNotifications.length}
            showSizeChanger
            onChange={(p, ps) => { setPage(p - 1); setSize(ps); }}
          />
        </div>
      </Card>
    </Space>
    </div>
  );
};

export default NotificationTab;
