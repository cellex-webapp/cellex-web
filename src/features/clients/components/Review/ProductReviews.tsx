/**
 * ProductReviews Component
 * 
 * The main component that displays all reviews for a product.
 * Combines ReviewStats, ReviewList, ReviewForm, and pagination.
 * 
 * Features:
 * - Review statistics display
 * - Paginated review list
 * - Create/update review form (for customers)
 * - Vendor response capabilities
 * - Helpful voting
 * - Filter and sort options
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Pagination, Empty, Select, Modal } from 'antd';
import { useReview } from '@/hooks/useReview';
import { ReviewStats } from './ReviewStats';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

interface ProductReviewsProps {
  /** Product ID to show reviews for */
  productId: string;
  /** Product name (for review form) */
  productName?: string;
  /** Product image (for review form) */
  productImage?: string;
  /** Shop ID (for vendor response) */
  shopId?: string;
  /** Current user info */
  currentUser?: {
    id: string;
    role: UserRole;
    shopId?: string; // Vendor's shop ID
  };
  /** Order ID for creating a review (comes from order page) */
  orderIdForReview?: string;
  /** Whether to show the review form */
  showReviewForm?: boolean;
  /** Callback when review form should be closed */
  onCloseReviewForm?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sort options
 */
const sortOptions = [
  { value: 'createdAt:desc', label: 'Mới nhất' },
  { value: 'createdAt:asc', label: 'Cũ nhất' },
  { value: 'rating:desc', label: 'Đánh giá cao nhất' },
  { value: 'rating:asc', label: 'Đánh giá thấp nhất' },
];

/**
 * Filter options by star rating
 */
const ratingFilterOptions = [
  { value: 0, label: 'Tất cả' },
  { value: 5, label: '5 sao' },
  { value: 4, label: '4 sao' },
  { value: 3, label: '3 sao' },
  { value: 2, label: '2 sao' },
  { value: 1, label: '1 sao' },
];

/**
 * Skeleton loader for review cards
 */
const ReviewCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-4 border border-gray-100 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
    </div>
    <div className="flex gap-2 mt-3">
      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  productImage,
  shopId,
  currentUser,
  orderIdForReview,
  showReviewForm = false,
  onCloseReviewForm,
  className = '',
}) => {
  // Hooks
  const {
    reviews,
    stats,
    pagination,
    isLoading,
    isLoadingStats,
    isSubmitting,
    fetchProductReviews,
    fetchProductStats,
    createReview,
    updateReview,
    addVendorResponse,
    deleteVendorResponse,
    markHelpful,
  } = useReview();

  // Local state
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<IReview | null>(null);

  // Check if current user is a vendor who owns this shop
  const isVendorOfShop = useMemo(() => {
    return currentUser?.role === 'VENDOR' && currentUser?.shopId === shopId;
  }, [currentUser, shopId]);

  // Check if current user is a customer (USER role)
  const isCustomer = currentUser?.role === 'USER';

  /**
   * Build pagination params from current state
   */
  const buildParams = useCallback((): IPaginationParams => {
    const [sortField, sortDirection] = sortBy.split(':');
    return {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: sortField,
      sortType: sortDirection as 'asc' | 'desc',
    };
  }, [sortBy, pagination.page, pagination.limit]);

  /**
   * Fetch reviews and stats on mount and when params change
   */
  useEffect(() => {
    fetchProductReviews(productId, buildParams());
  }, [productId, fetchProductReviews, buildParams]);

  useEffect(() => {
    fetchProductStats(productId);
  }, [productId, fetchProductStats]);

  /**
   * Open review modal from external trigger
   */
  useEffect(() => {
    if (showReviewForm && orderIdForReview) {
      setIsReviewModalOpen(true);
    }
  }, [showReviewForm, orderIdForReview]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page: number) => {
    fetchProductReviews(productId, { ...buildParams(), page });
    // Scroll to top of reviews section
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
  }, [productId, fetchProductReviews, buildParams]);

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    const [sortField, sortDirection] = value.split(':');
    fetchProductReviews(productId, {
      ...buildParams(),
      page: 1,
      sortBy: sortField,
      sortType: sortDirection as 'asc' | 'desc',
    });
  }, [productId, fetchProductReviews, buildParams]);

  /**
   * Handle rating filter change
   */
  const handleRatingFilterChange = useCallback((value: number) => {
    setRatingFilter(value);
    // Note: Backend would need to support rating filter
    // For now, we filter client-side
  }, []);

  /**
   * Filtered reviews based on rating selection
   */
  const filteredReviews = useMemo(() => {
    if (ratingFilter === 0) return reviews;
    return reviews.filter(review => review.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  /**
   * Handle review form submission
   */
  const handleReviewSubmit = useCallback(async (data: ICreateReviewRequest | IUpdateReviewRequest) => {
    if (editingReview) {
      // Update existing review
      await updateReview(editingReview.id, data as IUpdateReviewRequest);
      setEditingReview(null);
    } else {
      // Create new review
      await createReview(data as ICreateReviewRequest);
    }
    
    setIsReviewModalOpen(false);
    onCloseReviewForm?.();
    
    // Refresh reviews and stats
    fetchProductReviews(productId, buildParams());
    fetchProductStats(productId);
  }, [
    editingReview,
    updateReview,
    createReview,
    onCloseReviewForm,
    fetchProductReviews,
    fetchProductStats,
    productId,
    buildParams,
  ]);

  /**
   * Handle closing review modal
   */
  const handleCloseReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setEditingReview(null);
    onCloseReviewForm?.();
  }, [onCloseReviewForm]);

  /**
   * Handle vendor response submission
   */
  const handleAddVendorResponse = useCallback(async (reviewId: string, comment: string) => {
    await addVendorResponse(reviewId, comment);
  }, [addVendorResponse]);

  /**
   * Handle vendor response deletion
   */
  const handleDeleteVendorResponse = useCallback(async (reviewId: string) => {
    Modal.confirm({
      title: 'Xóa phản hồi',
      content: 'Bạn có chắc muốn xóa phản hồi này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => deleteVendorResponse(reviewId),
    });
  }, [deleteVendorResponse]);

  /**
   * Handle helpful vote
   */
  const handleVoteHelpful = useCallback((reviewId: string) => {
    if (!currentUser) {
      Modal.info({
        title: 'Đăng nhập',
        content: 'Vui lòng đăng nhập để đánh giá hữu ích.',
      });
      return;
    }
    markHelpful(reviewId);
  }, [currentUser, markHelpful]);

  /**
   * Find user's existing review for this product
   */
  const userExistingReview = useMemo(() => {
    if (!currentUser) return null;
    return reviews.find(r => r.user_id === currentUser.id);
  }, [reviews, currentUser]);

  return (
    <div id="reviews-section" className={`${className}`}>
      {/* Section Header */}
      <div className="bg-white rounded-lg p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Đánh giá sản phẩm
        </h2>

        {/* Statistics */}
        <ReviewStats
          stats={stats}
          isLoading={isLoadingStats}
        />
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Rating filter buttons */}
          <div className="flex flex-wrap gap-2">
            {ratingFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRatingFilterChange(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  ratingFilter === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={sortOptions}
            className="min-w-[150px]"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          <>
            <ReviewCardSkeleton />
            <ReviewCardSkeleton />
            <ReviewCardSkeleton />
          </>
        ) : filteredReviews.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500">
                  {ratingFilter > 0
                    ? `Không có đánh giá ${ratingFilter} sao nào`
                    : 'Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!'
                  }
                </span>
              }
            />
          </div>
        ) : (
          // Review cards
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUser?.id}
              currentUserRole={currentUser?.role}
              vendorShopId={isVendorOfShop ? currentUser?.shopId : undefined}
              isSubmittingResponse={isSubmitting}
              onVoteHelpful={handleVoteHelpful}
              onAddVendorResponse={handleAddVendorResponse}
              onDeleteVendorResponse={handleDeleteVendorResponse}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={pagination.page}
            total={pagination.total}
            pageSize={pagination.limit}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total) => `Tổng ${total} đánh giá`}
          />
        </div>
      )}

      {/* Floating Write Review Button (for customers only) */}
      {isCustomer && !userExistingReview && orderIdForReview && (
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="fixed bottom-6 right-6 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 z-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Viết đánh giá
        </button>
      )}

      {/* Edit Review Button (if user has existing review) */}
      {isCustomer && userExistingReview && (
        <button
          onClick={() => {
            setEditingReview(userExistingReview);
            setIsReviewModalOpen(true);
          }}
          className="fixed bottom-6 right-6 px-6 py-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2 z-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Sửa đánh giá
        </button>
      )}

      {/* Review Form Modal */}
      <Modal
        open={isReviewModalOpen}
        onCancel={handleCloseReviewModal}
        footer={null}
        width={600}
        destroyOnClose
        centered
      >
        <ReviewForm
          orderId={orderIdForReview}
          productId={productId}
          productName={productName}
          productImage={productImage}
          existingReview={editingReview || undefined}
          isSubmitting={isSubmitting}
          onSubmit={handleReviewSubmit}
          onCancel={handleCloseReviewModal}
        />
      </Modal>
    </div>
  );
};

export default ProductReviews;
