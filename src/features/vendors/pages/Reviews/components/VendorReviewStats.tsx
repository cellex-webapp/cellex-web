/**
 * Vendor Review Stats Component
 * 
 * Displays overview statistics for vendor's shop reviews.
 */

import React from 'react';
import { Card, Progress, Typography } from 'antd';
import {
  StarFilled,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface ReviewStatsProps {
  stats: {
    totalReviews: number;
    averageRating: number;
    withResponse: number;
    withoutResponse: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

const VendorReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  const responseRate = stats.totalReviews > 0
    ? Math.round((stats.withResponse / stats.totalReviews) * 100)
    : 0;

  // Get total for current page distribution
  const distributionTotal = Object.values(stats.ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Reviews */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <MessageOutlined className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <Text type="secondary" className="text-sm block">Tổng đánh giá</Text>
            <div className="flex items-center gap-1 h-9">
              <Title level={3} className="!mb-0 !text-blue-700">
                {stats.totalReviews}
              </Title>
            </div>
          </div>
        </div>
      </Card>

      {/* Average Rating */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="flex items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
            <StarFilled className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <Text type="secondary" className="text-sm block">Đánh giá TB</Text>
            <div className="flex items-center gap-1 h-9">
              <Title level={3} className="!mb-0 !text-yellow-700">
                {stats.averageRating || 0}
              </Title>
              <StarFilled className="text-yellow-500" />
            </div>
          </div>
        </div>
      </Card>

      {/* Responded */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <CheckCircleOutlined className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <Text type="secondary" className="text-sm block">Đã phản hồi</Text>
            <div className="flex items-center gap-1 h-9">
              <Title level={3} className="!mb-0 !text-green-700">
                {stats.withResponse}
              </Title>
            </div>
          </div>
        </div>
      </Card>

      {/* Pending Response */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-100">
        <div className="flex items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <ClockCircleOutlined className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <Text type="secondary" className="text-sm block">Chờ phản hồi</Text>
            <div className="flex items-center gap-1 h-9">
              <Title level={3} className="!mb-0 !text-orange-700">
                {stats.withoutResponse}
              </Title>
            </div>
          </div>
        </div>
      </Card>

      {/* Response Rate Progress */}
      <Card className="border-0 shadow-sm md:col-span-2" bodyStyle={{ padding: '16px 24px' }}>
        <Text strong className="text-gray-700">Tỷ lệ phản hồi</Text>
        <div className="flex items-center gap-4 mt-3">
          <Progress
            percent={responseRate}
            strokeColor={{
              '0%': '#6366f1',
              '100%': '#8b5cf6',
            }}
            trailColor="#e5e7eb"
            className="flex-1"
            format={(percent) => (
              <span className="text-indigo-600 font-semibold">{percent}%</span>
            )}
          />
        </div>
        <Text type="secondary" className="text-xs mt-2 block">
          {stats.withResponse} / {stats.totalReviews} đánh giá đã được phản hồi
        </Text>
      </Card>

      {/* Rating Distribution */}
      <Card className="border-0 shadow-sm md:col-span-2" bodyStyle={{ padding: '16px 24px' }}>
        <Text strong className="text-gray-700">Phân bố đánh giá (trang hiện tại)</Text>
        <div className="mt-3 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
            const percentage = distributionTotal > 0
              ? Math.round((count / distributionTotal) * 100)
              : 0;
            
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-600">{star}</span>
                  <StarFilled className="text-yellow-400 text-sm" />
                </div>
                <Progress
                  percent={percentage}
                  showInfo={false}
                  strokeColor={
                    star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444'
                  }
                  trailColor="#e5e7eb"
                  className="flex-1"
                  size="small"
                />
                <span className="text-sm text-gray-500 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default VendorReviewStats;
