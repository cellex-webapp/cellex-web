/**
 * Review Status Badge Component
 * 
 * Displays a colored badge indicating the review's moderation status.
 * Uses Tailwind CSS for consistent styling across the admin dashboard.
 */

import React from 'react';
import { 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

/**
 * Status configuration with colors, labels, and icons
 */
const REVIEW_STATUS_CONFIG: Record<ReviewStatus, {
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
  icon: React.ReactNode;
}> = {
  PENDING_MODERATION: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    label: 'Chờ kiểm duyệt',
    icon: <ClockCircleOutlined />,
  },
  APPROVED: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    label: 'Đã duyệt (tự động)',
    icon: <CheckCircleOutlined />,
  },
  APPROVED_BY_ADMIN: {
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    label: 'Đã duyệt (admin)',
    icon: <CheckCircleOutlined />,
  },
  REJECTED_AUTO: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    label: 'Từ chối (tự động)',
    icon: <ExclamationCircleOutlined />,
  },
  REJECTED_BY_ADMIN: {
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    label: 'Từ chối (admin)',
    icon: <CloseCircleOutlined />,
  },
  HIDDEN: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    label: 'Đã ẩn',
    icon: <EyeInvisibleOutlined />,
  },
};

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  showIcon?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

/**
 * ReviewStatusBadge Component
 * 
 * @param status - Review status to display
 * @param showIcon - Whether to show the status icon (default: true)
 * @param size - Badge size variant
 * @param className - Additional CSS classes
 */
export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'default',
  className = '',
}) => {
  const config = REVIEW_STATUS_CONFIG[status];
  
  if (!config) {
    return <span className="text-gray-500">Không xác định</span>;
  }

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
    >
      {showIcon && <span className="flex-shrink-0">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

/**
 * Get status color for charts/tables
 */
export const getStatusColor = (status: ReviewStatus): string => {
  const colorMap: Record<ReviewStatus, string> = {
    PENDING_MODERATION: '#eab308',
    APPROVED: '#22c55e',
    APPROVED_BY_ADMIN: '#10b981',
    REJECTED_AUTO: '#ef4444',
    REJECTED_BY_ADMIN: '#f43f5e',
    HIDDEN: '#6b7280',
  };
  return colorMap[status] || '#6b7280';
};

/**
 * Get status label in Vietnamese
 */
export const getStatusLabel = (status: ReviewStatus): string => {
  return REVIEW_STATUS_CONFIG[status]?.label || 'Không xác định';
};

/**
 * Check if status is approved (publicly visible)
 */
export const isApprovedStatus = (status: ReviewStatus): boolean => {
  return status === 'APPROVED' || status === 'APPROVED_BY_ADMIN';
};

/**
 * Check if status is rejected
 */
export const isRejectedStatus = (status: ReviewStatus): boolean => {
  return status === 'REJECTED_AUTO' || status === 'REJECTED_BY_ADMIN';
};

export default ReviewStatusBadge;
