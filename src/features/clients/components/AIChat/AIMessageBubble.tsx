import React from 'react';
import { Avatar, Card, Table, Tag } from 'antd';
import { RobotOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import type { AIMessage } from '@/services/ai.service';
import moment from 'moment-timezone';
import ReactMarkdown from 'react-markdown';
import AIProductCard from './AIProductCard';
import AIChartRenderer from './AIChartRenderer';

interface AIMessageBubbleProps {
  message: AIMessage;
  isUser: boolean;
}

const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({ message, isUser }) => {
  const metadata = message.metadata as any;
  
  const renderContent = () => {
    // Render markdown content
    const textContent = (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            // Custom renderers for markdown
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            code: ({ children }) => (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">{children}</pre>
            ),
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );

    return textContent;
  };

  const renderMetadata = () => {
    if (!metadata) return null;

    const elements: React.ReactNode[] = [];

    // Product IDs - render product cards
    if (metadata.productIds && metadata.productIds.length > 0) {
      elements.push(
        <div key="products" className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingOutlined className="text-blue-600" />
            <span className="font-medium text-gray-700">Sản phẩm gợi ý:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metadata.productIds.slice(0, 6).map((productId: string) => (
              <AIProductCard key={productId} productId={productId} />
            ))}
          </div>
          {metadata.productIds.length > 6 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              ... và {metadata.productIds.length - 6} sản phẩm khác
            </p>
          )}
        </div>
      );
    }

    // Chart data
    if (metadata.chartData) {
      elements.push(
        <div key="chart" className="mt-4">
          <AIChartRenderer chartData={metadata.chartData} />
        </div>
      );
    }

    // Table data
    if (metadata.tableData && metadata.tableData.length > 0) {
      const columns = Object.keys(metadata.tableData[0]).map(key => ({
        title: formatColumnTitle(key),
        dataIndex: key,
        key,
        render: (value: any) => formatCellValue(key, value),
      }));

      elements.push(
        <div key="table" className="mt-4 overflow-x-auto">
          <Table
            dataSource={metadata.tableData.map((item: any, idx: number) => ({ ...item, key: idx }))}
            columns={columns}
            pagination={false}
            size="small"
            bordered
            className="bg-white rounded-lg"
          />
        </div>
      );
    }

    // Coupon suggestions
    if (metadata.couponSuggestions && metadata.couponSuggestions.length > 0) {
      elements.push(
        <div key="coupons" className="mt-4 space-y-3">
          <div className="font-medium text-gray-700">💡 Gợi ý khuyến mãi:</div>
          {metadata.couponSuggestions.map((suggestion: any, idx: number) => (
            <Card key={idx} size="small" className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{suggestion.productName}</p>
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  <div className="flex gap-2 mt-2">
                    <Tag color="blue">Views: {suggestion.viewCount}</Tag>
                    <Tag color="green">Sold: {suggestion.purchaseCount}</Tag>
                  </div>
                </div>
                <Tag color="orange" className="text-lg font-bold">
                  -{suggestion.suggestedDiscount}%
                </Tag>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return elements.length > 0 ? <>{elements}</> : null;
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%]">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-none px-4 py-3 shadow-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block text-right">
            {moment(message.createdAt).format('HH:mm')}
          </span>
        </div>
        <Avatar 
          icon={<UserOutlined />} 
          className="bg-blue-500 flex-shrink-0"
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <RobotOutlined className="text-white text-sm" />
      </div>
      <div className="max-w-[85%]">
        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
          {renderContent()}
          {renderMetadata()}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 block">
          {moment(message.createdAt).format('HH:mm')}
        </span>
      </div>
    </div>
  );
};

// Helper functions
function formatColumnTitle(key: string): string {
  const titles: Record<string, string> = {
    stt: 'STT',
    segmentName: 'Phân khúc',
    userCount: 'Số KH',
    totalSpend: 'Tổng chi tiêu',
    avgSpend: 'TB chi tiêu',
    name: 'Tên sản phẩm',
    productName: 'Tên sản phẩm',
    price: 'Giá',
    brand: 'Thương hiệu',
    stockQuantity: 'Tồn kho',
    purchaseCount: 'Đã bán',
    rating: 'Đánh giá',
    urgency: 'Mức độ',
    revenue: 'Doanh thu',
    totalRevenue: 'Tổng doanh thu',
  };
  return titles[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

function formatCellValue(key: string, value: any): React.ReactNode {
  if (value === null || value === undefined) return '-';
  
  // STT column - center aligned
  if (key === 'stt') {
    return <span className="font-semibold">{value}</span>;
  }
  
  // Currency formatting
  if (key.includes('Spend') || key.includes('revenue') || key === 'price' || key === 'totalRevenue') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  }
  
  // Rating formatting
  if (key === 'rating') {
    return <span className="text-yellow-500">⭐ {value}</span>;
  }
  
  // Urgency tags
  if (key === 'urgency') {
    const colors: Record<string, string> = {
      CRITICAL: 'red',
      HIGH: 'orange',
      MEDIUM: 'gold',
    };
    return <Tag color={colors[value] || 'default'}>{value}</Tag>;
  }
  
  // Number formatting
  if (typeof value === 'number') {
    return new Intl.NumberFormat('vi-VN').format(value);
  }
  
  return String(value);
}

export default AIMessageBubble;
