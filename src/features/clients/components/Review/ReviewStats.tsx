/**
 * ReviewStats Component
 * 
 * Displays rating statistics for a product including:
 * - Average rating with stars
 * - Total review count
 * - Rating distribution (1-5 stars) with progress bars
 * 
 * Inspired by Shopee/Lazada review statistics layout.
 */

import React from 'react';
import { StarRating } from './StarRating';

interface ReviewStatsProps {
  /** Review statistics data */
  stats: IReviewStats | null;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for stats
 */
const StatsSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex flex-col md:flex-row gap-6">
      {/* Average rating skeleton */}
      <div className="flex flex-col items-center justify-center min-w-[140px] py-4">
        <div className="h-12 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      
      {/* Distribution bars skeleton */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center gap-3">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="flex-1 h-3 bg-gray-200 rounded-full" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Empty state when no reviews exist
 */
const EmptyStats: React.FC = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có đánh giá</h3>
    <p className="text-gray-500 text-sm">
      Hãy là người đầu tiên đánh giá sản phẩm này!
    </p>
  </div>
);

/**
 * Rating distribution bar component
 */
const RatingBar: React.FC<{
  stars: number;
  count: number;
  percentage: number;
}> = ({ stars, count, percentage }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Star label */}
      <div className="flex items-center gap-1 min-w-[60px]">
        <span className="text-sm text-gray-600">{stars}</span>
        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Count */}
      <div className="min-w-[50px] text-right">
        <span className="text-sm text-gray-500">
          {count.toLocaleString('vi-VN')}
        </span>
      </div>
    </div>
  );
};

export const ReviewStats: React.FC<ReviewStatsProps> = ({
  stats,
  isLoading = false,
  className = '',
}) => {
  // Show skeleton during loading
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <StatsSkeleton />
      </div>
    );
  }

  // Show empty state if no stats or no reviews
  if (!stats || stats.total_reviews === 0) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <EmptyStats />
      </div>
    );
  }

  // Rating distribution data
  const distribution = [
    { stars: 5, count: stats.five_star_count, percentage: stats.five_star_percentage },
    { stars: 4, count: stats.four_star_count, percentage: stats.four_star_percentage },
    { stars: 3, count: stats.three_star_count, percentage: stats.three_star_percentage },
    { stars: 2, count: stats.two_star_count, percentage: stats.two_star_percentage },
    { stars: 1, count: stats.one_star_count, percentage: stats.one_star_percentage },
  ];

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Average Rating Section */}
        <div className="flex flex-col items-center justify-center min-w-[160px] py-4 border-b md:border-b-0 md:border-r border-gray-200 md:pr-6">
          {/* Large average number */}
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.average_rating.toFixed(1)}
          </div>
          
          {/* Stars display */}
          <StarRating
            value={stats.average_rating}
            readonly
            size="lg"
            className="mb-2"
          />
          
          {/* Total count */}
          <div className="text-sm text-gray-500">
            {stats.total_reviews.toLocaleString('vi-VN')} đánh giá
          </div>
        </div>

        {/* Rating Distribution Section */}
        <div className="flex-1 space-y-2.5">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Phân bố đánh giá
          </h4>
          {distribution.map((item) => (
            <RatingBar
              key={item.stars}
              stars={item.stars}
              count={item.count}
              percentage={item.percentage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
