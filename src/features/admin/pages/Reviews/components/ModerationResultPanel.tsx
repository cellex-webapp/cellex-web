/**
 * Moderation Result Panel Component
 * 
 * Displays OpenAI moderation results including flagged categories,
 * confidence scores, and violation details.
 */

import React from 'react';
import { Progress, Tooltip } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { formatDateVN } from '@/utils/date';

/**
 * Category labels in Vietnamese
 */
const CATEGORY_LABELS: Record<string, string> = {
  hate: 'Ngôn từ thù địch',
  'hate/threatening': 'Đe dọa thù địch',
  harassment: 'Quấy rối',
  'harassment/threatening': 'Quấy rối đe dọa',
  'self-harm': 'Tự gây hại',
  'self-harm/intent': 'Ý định tự hại',
  'self-harm/instructions': 'Hướng dẫn tự hại',
  sexual: 'Nội dung tình dục',
  'sexual/minors': 'Tình dục trẻ em',
  violence: 'Bạo lực',
  'violence/graphic': 'Bạo lực hình ảnh',
};

/**
 * Get category color based on score
 */
const getCategoryColor = (score: number): string => {
  if (score >= 0.8) return '#ef4444'; // Red
  if (score >= 0.5) return '#f97316'; // Orange
  if (score >= 0.3) return '#eab308'; // Yellow
  return '#22c55e'; // Green
};

/**
 * Get category severity label
 */
const getSeverityLabel = (score: number): string => {
  if (score >= 0.8) return 'Rất cao';
  if (score >= 0.5) return 'Cao';
  if (score >= 0.3) return 'Trung bình';
  return 'Thấp';
};

interface ModerationResultPanelProps {
  moderationResult?: IModerationResult;
  rejectionReason?: string;
  flaggedCategoriesVi?: string[];
  className?: string;
}

/**
 * ModerationResultPanel Component
 * 
 * Shows detailed moderation analysis from OpenAI
 */
export const ModerationResultPanel: React.FC<ModerationResultPanelProps> = ({
  moderationResult,
  rejectionReason,
  flaggedCategoriesVi,
  className = '',
}) => {
  if (!moderationResult) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <InfoCircleOutlined />
          <span>Chưa có kết quả kiểm duyệt</span>
        </div>
      </div>
    );
  }

  const { is_flagged, flagged_categories, category_scores, moderated_at, model_used } = moderationResult;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-blue-500" />
            <span className="font-medium text-gray-700">Kết quả kiểm duyệt tự động</span>
          </div>
          <div className={`
            flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
            ${is_flagged 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
            }
          `}>
            {is_flagged ? (
              <>
                <WarningOutlined />
                <span>Phát hiện vi phạm</span>
              </>
            ) : (
              <>
                <CheckCircleOutlined />
                <span>Không vi phạm</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Only show detailed content if is_flagged is true */}
      {is_flagged && (
        <div className="p-4 space-y-4">
          {/* Rejection Reason */}
          {rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
              <p className="text-sm text-red-700">{rejectionReason}</p>
            </div>
          )}

          {/* Flagged Categories (Vietnamese) */}
          {flaggedCategoriesVi && flaggedCategoriesVi.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm font-medium text-orange-800 mb-2">Nội dung vi phạm:</p>
            <div className="flex flex-wrap gap-2">
              {flaggedCategoriesVi.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Flagged Categories from API */}
        {flagged_categories && flagged_categories.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Danh mục vi phạm (API):</p>
            <div className="flex flex-wrap gap-2">
              {flagged_categories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium"
                >
                  {CATEGORY_LABELS[category] || category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Scores */}
        {category_scores && Object.keys(category_scores).length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Điểm đánh giá theo danh mục:
            </p>
            <div className="space-y-3">
              {Object.entries(category_scores)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6) // Show top 6 scores
                .map(([category, score]) => {
                  const percentage = Math.round(score * 100);
                  const color = getCategoryColor(score);
                  const label = CATEGORY_LABELS[category] || category;
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <Tooltip title={category}>
                          <span className="text-sm text-gray-600">{label}</span>
                        </Tooltip>
                        <span 
                          className="text-xs font-medium"
                          style={{ color }}
                        >
                          {percentage}% ({getSeverityLabel(score)})
                        </span>
                      </div>
                      <Progress
                        percent={percentage}
                        size="small"
                        strokeColor={color}
                        showInfo={false}
                      />
                    </div>
                  );
                })}
            </div>
            
            {/* Show more if there are additional categories */}
            {Object.keys(category_scores).length > 6 && (
              <p className="text-xs text-gray-500 mt-2">
                +{Object.keys(category_scores).length - 6} danh mục khác
              </p>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

/**
 * Compact version for table cells
 */
export const ModerationBadge: React.FC<{
  moderationResult?: IModerationResult;
  size?: 'small' | 'default';
}> = ({ moderationResult, size = 'default' }) => {
  if (!moderationResult) {
    return (
      <span className="text-gray-400 text-xs">—</span>
    );
  }

  const { is_flagged, flagged_categories } = moderationResult;
  
  const sizeClasses = size === 'small' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <Tooltip
      title={
        is_flagged && flagged_categories
          ? `Vi phạm: ${flagged_categories.map(c => CATEGORY_LABELS[c] || c).join(', ')}`
          : 'Không phát hiện vi phạm'
      }
    >
      <span
        className={`
          inline-flex items-center gap-1 rounded font-medium
          ${sizeClasses}
          ${is_flagged
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
          }
        `}
      >
        {is_flagged ? (
          <>
            <WarningOutlined />
            <span>{flagged_categories?.length || 0} vi phạm</span>
          </>
        ) : (
          <>
            <CheckCircleOutlined />
            <span>OK</span>
          </>
        )}
      </span>
    </Tooltip>
  );
};

export default ModerationResultPanel;
