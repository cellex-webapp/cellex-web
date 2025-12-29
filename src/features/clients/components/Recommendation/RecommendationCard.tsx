/**
 * RecommendationCard Component
 * Enhanced product card with recommendation badges and explanations
 * Extends the existing ProductCard design pattern
 */
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag, Rate, Tooltip } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import type { IRecommendationResponse } from '@/services/recommendation.service';

interface Props {
  recommendation: IRecommendationResponse;
  showExplanation?: boolean;
}

const RecommendationCard: React.FC<Props> = memo(({
  recommendation,
  showExplanation = true,
}) => {
  const {
    product_id,
    product_name,
    product_image,
    price,
    final_price,
    average_rating,
    review_count,
    explanation,
  } = recommendation;

  const hasSale = price > final_price;
  const salePercent = hasSale ? Math.round(((price - final_price) / price) * 100) : 0;

  return (
    <Link
      to={`/products/${product_id}`}
      className="no-underline text-inherit block h-full group"
    >
      <Card
        hoverable
        className="h-full flex flex-col rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg"
        bodyStyle={{ padding: 12 }}
        cover={
          <div className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
            {/* Product Image */}
            {product_image ? (
              <img
                src={product_image}
                alt={product_name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <AppstoreOutlined className="text-4xl text-gray-400" />
              </div>
            )}
          </div>
        }
      >
        <div className="flex-1 flex flex-col gap-2">
          {/* Product Name */}
          <Tooltip title={product_name}>
            <div className="min-h-[40px] text-sm font-medium text-gray-800 line-clamp-2">
              {product_name}
            </div>
          </Tooltip>

          {/* Price Section - with sale tag inline like ProductCard */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-semibold text-orange-600">
              {final_price.toLocaleString()}₫
            </span>
            {hasSale && (
              <span className="text-xs line-through text-gray-400">
                {price.toLocaleString()}₫
              </span>
            )}
            {hasSale && (
              <Tag color="red" className="m-0 text-[11px] px-1">
                -{salePercent}%
              </Tag>
            )}
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Rate
              allowHalf
              disabled
              value={average_rating}
              style={{ fontSize: 12 }}
            />
            <span>({review_count || 0})</span>
          </div>

          {/* Explanation Text (optional) */}
          {showExplanation && explanation && (
            <div className="mt-1 text-xs text-gray-500 italic line-clamp-1">
              {explanation}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});

RecommendationCard.displayName = 'RecommendationCard';

export default RecommendationCard;
