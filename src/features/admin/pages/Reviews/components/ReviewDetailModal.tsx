/**
 * Review Detail Modal Component
 * 
 * Drawer component that displays complete review details including
 * product info, user info, media, moderation results, and admin history.
 */

import React from 'react';
import { 
  Drawer, 
  Descriptions, 
  Image, 
  Avatar, 
  Divider, 
  Button, 
  Space,
  Rate,
  Typography,
} from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { formatDateVN } from '@/utils/date';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { ModerationResultPanel } from './ModerationResultPanel';

const { Text, Paragraph } = Typography;

interface ReviewDetailModalProps {
  review: IAdminReview | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (reviewId: string) => void;
  onReject?: (reviewId: string) => void;
  onHide?: (reviewId: string) => void;
  onRemoderate?: (reviewId: string) => void;
  isActionLoading?: boolean;
}

/**
 * ReviewDetailModal Component
 */
export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  open,
  onClose,
  onApprove,
  onReject,
  onHide,
  onRemoderate,
  isActionLoading = false,
}) => {
  if (!review) return null;

  /**
   * Render action buttons based on current status
   */
  const renderActionButtons = () => {
    const buttons: React.ReactNode[] = [];
    const { status, id } = review;

    // Approve button - for pending, auto-rejected, or hidden reviews
    if (['PENDING_MODERATION', 'REJECTED_AUTO', 'HIDDEN'].includes(status)) {
      buttons.push(
        <Button
          key="approve"
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => onApprove?.(id)}
          loading={isActionLoading}
          className="bg-green-500 hover:bg-green-600 border-green-500"
        >
          Duyệt
        </Button>
      );
    }

    // Reject button - for pending or approved reviews
    if (['PENDING_MODERATION', 'APPROVED', 'APPROVED_BY_ADMIN'].includes(status)) {
      buttons.push(
        <Button
          key="reject"
          danger
          icon={<CloseCircleOutlined />}
          onClick={() => onReject?.(id)}
          loading={isActionLoading}
        >
          Từ chối
        </Button>
      );
    }

    // Hide button - for approved reviews
    if (['APPROVED', 'APPROVED_BY_ADMIN'].includes(status)) {
      buttons.push(
        <Button
          key="hide"
          icon={<EyeInvisibleOutlined />}
          onClick={() => onHide?.(id)}
          loading={isActionLoading}
        >
          Ẩn
        </Button>
      );
    }

    // Remoderate button - for pending or auto-rejected reviews
    if (['PENDING_MODERATION', 'REJECTED_AUTO'].includes(status)) {
      buttons.push(
        <Button
          key="remoderate"
          icon={<ReloadOutlined />}
          onClick={() => onRemoderate?.(id)}
          loading={isActionLoading}
        >
          Kiểm duyệt lại
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-8">
          <div>
            <Text type="secondary" className="text-xs">CHI TIẾT ĐÁNH GIÁ</Text>
            <div className="flex items-center gap-3 mt-1">
              <ReviewStatusBadge status={review.status} size="small" />
            </div>
          </div>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Space>
            {renderActionButtons()}
          </Space>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Product Info */}
        <section>
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <ShoppingOutlined />
            Thông tin sản phẩm
          </h4>
          <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
            {review.product_image ? (
              <Image
                src={review.product_image}
                alt={review.product_name || 'Product'}
                width={80}
                height={80}
                className="rounded-lg object-cover"
                fallback="https://placehold.co/80x80?text=No+Image"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <ShoppingOutlined className="text-gray-400 text-2xl" />
              </div>
            )}
            <div className="flex-1">
              <Text strong className="text-base">
                {review.product_name || 'N/A'}
              </Text>
              {review.product_price && (
                <div className="mt-1">
                  <Text type="secondary">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(review.product_price)}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </section>

        <Divider className="my-4" />

        {/* User Info */}
        <section>
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <UserOutlined />
            Thông tin người đánh giá
          </h4>
          <div className="flex items-center gap-3">
            <Avatar 
              size={48} 
              src={review.user_avatar} 
              icon={<UserOutlined />}
            />
            <div>
              <Text strong>{review.user_name || 'Ẩn danh'}</Text>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                  <CheckCircleOutlined />
                  Đã mua hàng
                </span>
              )}
            </div>
          </div>
        </section>

        <Divider className="my-4" />

        {/* Review Content */}
        <section>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Nội dung đánh giá</h4>
          
          {/* Rating */}
          <div className="flex items-center gap-3 mb-3">
            <Rate disabled value={review.rating} />
            <Text strong className="text-lg">{review.rating}/5</Text>
          </div>
          
          {/* Comment */}
          {review.comment ? (
            <Paragraph className="bg-gray-50 p-4 rounded-lg text-gray-700">
              {review.comment}
            </Paragraph>
          ) : (
            <Text type="secondary" italic>Không có bình luận</Text>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="mt-4">
              <Text type="secondary" className="text-sm mb-2 block">
                Hình ảnh ({review.images.length}):
              </Text>
              <Image.PreviewGroup>
                <div className="flex flex-wrap gap-2">
                  {review.images.map((url, index) => (
                    <Image
                      key={index}
                      src={url}
                      alt={`Review image ${index + 1}`}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}

          {/* Videos */}
          {review.videos && review.videos.length > 0 && (
            <div className="mt-4">
              <Text type="secondary" className="text-sm mb-2 block">
                Video ({review.videos.length}):
              </Text>
              <div className="grid grid-cols-2 gap-2">
                {review.videos.map((url, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <video
                      src={url}
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <Divider className="my-4" />

        {/* Moderation Result */}
        <section>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Kết quả kiểm duyệt</h4>
          <ModerationResultPanel
            moderationResult={review.moderation_result}
            rejectionReason={review.rejection_reason}
            flaggedCategoriesVi={review.flagged_categories_vi}
          />
        </section>

        {/* Admin Decision History */}
        {review.admin_decision && (
          <>
            <Divider className="my-4" />
            <section>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Quyết định của Admin</h4>
              <div className={`
                rounded-lg p-4 border
                ${review.admin_decision.action === 'APPROVE' 
                  ? 'bg-green-50 border-green-200' 
                  : review.admin_decision.action === 'REJECT'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }
              `}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Hành động">
                    <span className={`font-medium ${
                      review.admin_decision.action === 'APPROVE' 
                        ? 'text-green-700' 
                        : review.admin_decision.action === 'REJECT'
                          ? 'text-red-700'
                          : 'text-gray-700'
                    }`}>
                      {review.admin_decision.action === 'APPROVE' && 'Đã duyệt'}
                      {review.admin_decision.action === 'REJECT' && 'Đã từ chối'}
                      {review.admin_decision.action === 'HIDE' && 'Đã ẩn'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Admin">
                    {review.admin_decision.admin_name || review.admin_decision.admin_id}
                  </Descriptions.Item>
                  {review.admin_decision.reason && (
                    <Descriptions.Item label="Lý do">
                      {review.admin_decision.reason}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Thời gian">
                    {formatDateVN(review.admin_decision.decided_at)}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </section>
          </>
        )}

        {/* Vendor Response */}
        {review.vendor_response && (
          <>
            <Divider className="my-4" />
            <section>
              <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <ShopOutlined />
                Phản hồi từ người bán
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Text strong className="text-blue-700">
                    {review.vendor_response.vendorName}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {formatDateVN(review.vendor_response.createdAt)}
                  </Text>
                </div>
                <Paragraph className="!mb-0 text-gray-700">
                  {review.vendor_response.comment}
                </Paragraph>
              </div>
            </section>
          </>
        )}

        <Divider className="my-4" />

        {/* Meta Info */}
        <section>
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <CalendarOutlined />
            Thông tin khác
          </h4>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày tạo">
              {formatDateVN(review.created_at)}
            </Descriptions.Item>
            {review.updated_at && (
              <Descriptions.Item label="Cập nhật">
                {formatDateVN(review.updated_at)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Lượt thấy hữu ích">
              {review.helpful_count || 0}
            </Descriptions.Item>
          </Descriptions>
        </section>
      </div>
    </Drawer>
  );
};

export default ReviewDetailModal;
