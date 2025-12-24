/**
 * ReviewCard Component
 * 
 * Displays a single review with all its details including:
 * - User info (avatar, name)
 * - Rating stars
 * - Review content (text, images, videos)
 * - Verified purchase badge
 * - Helpful vote button
 * - Vendor response (if exists)
 * 
 * Inspired by Shopee/Lazada review card design.
 */

import React, { useState, useCallback } from 'react';
import { StarRating } from './StarRating';
import { ImagePreviewModal } from './ImagePreviewModal';
import { VendorResponseDisplay, VendorResponseForm } from './VendorResponseForm';

interface ReviewCardProps {
  /** Review data */
  review: IReview;
  /** Current user ID (for ownership checks) */
  currentUserId?: string;
  /** Current user role */
  currentUserRole?: UserRole;
  /** Shop ID that the vendor owns (for vendor response) */
  vendorShopId?: string;
  /** Loading state for helpful vote */
  isVotingHelpful?: boolean;
  /** Loading state for vendor response */
  isSubmittingResponse?: boolean;
  /** Callback for helpful vote */
  onVoteHelpful?: (reviewId: string) => void;
  /** Callback for adding vendor response */
  onAddVendorResponse?: (reviewId: string, comment: string) => Promise<void>;
  /** Callback for deleting vendor response */
  onDeleteVendorResponse?: (reviewId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default avatar placeholder
 */
const DefaultAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
      {initial}
    </div>
  );
};

/**
 * Verified purchase badge
 */
const VerifiedBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
    Đã mua hàng
  </span>
);

/**
 * Format date to Vietnamese locale
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hôm nay';
  } else if (diffDays === 1) {
    return 'Hôm qua';
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} tuần trước`;
  } else {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId: _currentUserId, // Reserved for future use (e.g., edit own review)
  currentUserRole,
  vendorShopId,
  isVotingHelpful = false,
  isSubmittingResponse = false,
  onVoteHelpful,
  onAddVendorResponse,
  onDeleteVendorResponse,
  className = '',
}) => {
  // State for image preview modal
  const [previewImages, setPreviewImages] = useState<string[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  // State for vendor response form
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);

  // Check if current user is the vendor who owns this shop
  const isVendorOfShop = currentUserRole === 'VENDOR' && vendorShopId === review.shop_id;

  // Check if user has already voted
  const hasVoted = review.has_voted_helpful;

  /**
   * Open image preview modal
   */
  const handleImageClick = useCallback((images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
  }, []);

  /**
   * Close image preview modal
   */
  const handleClosePreview = useCallback(() => {
    setPreviewImages(null);
  }, []);

  /**
   * Handle helpful vote
   */
  const handleHelpfulClick = useCallback(() => {
    if (!hasVoted && onVoteHelpful) {
      onVoteHelpful(review.id);
    }
  }, [hasVoted, onVoteHelpful, review.id]);

  /**
   * Handle vendor response submit
   */
  const handleResponseSubmit = useCallback(async (comment: string) => {
    if (onAddVendorResponse) {
      await onAddVendorResponse(review.id, comment);
      setShowResponseForm(false);
      setIsEditingResponse(false);
    }
  }, [onAddVendorResponse, review.id]);

  /**
   * Handle vendor response delete
   */
  const handleResponseDelete = useCallback(() => {
    if (onDeleteVendorResponse) {
      onDeleteVendorResponse(review.id);
    }
  }, [onDeleteVendorResponse, review.id]);

  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-100 ${className}`}>
      {/* Header: User info */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {review.user_avatar ? (
          <img
            src={review.user_avatar}
            alt={review.user_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <DefaultAvatar name={review.user_name} />
        )}

        <div className="flex-1 min-w-0">
          {/* User name and badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 truncate">
              {review.user_name}
            </span>
            {review.is_verified_purchase && <VerifiedBadge />}
          </div>

          {/* Rating and date */}
          <div className="flex items-center gap-3 mt-1">
            <StarRating value={review.rating} readonly size="sm" />
            <span className="text-xs text-gray-500">
              {formatDate(review.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Review content */}
      <div className="mt-3">
        {/* Comment text */}
        {review.comment && (
          <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
            {review.comment}
          </p>
        )}

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {review.images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(review.images!, index)}
                className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <img
                  src={image}
                  alt={`Ảnh đánh giá ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Videos */}
        {review.videos && review.videos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {review.videos.map((video, index) => (
              <div
                key={index}
                className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                <video
                  src={video}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful vote section */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleHelpfulClick}
          disabled={hasVoted || isVotingHelpful}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
            hasVoted
              ? 'bg-indigo-100 text-indigo-700 cursor-default'
              : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
          } disabled:opacity-60`}
        >
          <svg
            className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`}
            fill={hasVoted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={hasVoted ? 0 : 2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Hữu ích</span>
          {(review.helpful_count ?? 0) > 0 && (
            <span className="font-medium">({review.helpful_count})</span>
          )}
        </button>

        {/* Vendor response button (only for shop owner) */}
        {isVendorOfShop && !review.vendor_response && !showResponseForm && (
          <button
            onClick={() => setShowResponseForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>Phản hồi</span>
          </button>
        )}
      </div>

      {/* Vendor response form */}
      {showResponseForm && !review.vendor_response && (
        <VendorResponseForm
          isSubmitting={isSubmittingResponse}
          onSubmit={handleResponseSubmit}
          onCancel={() => setShowResponseForm(false)}
        />
      )}

      {/* Existing vendor response */}
      {review.vendor_response && !isEditingResponse && (
        <VendorResponseDisplay
          response={review.vendor_response}
          canEdit={isVendorOfShop}
          isDeleting={isSubmittingResponse}
          onEdit={() => setIsEditingResponse(true)}
          onDelete={handleResponseDelete}
        />
      )}

      {/* Edit vendor response form */}
      {isEditingResponse && review.vendor_response && (
        <VendorResponseForm
          initialValue={review.vendor_response.comment}
          isEditMode
          isSubmitting={isSubmittingResponse}
          onSubmit={handleResponseSubmit}
          onCancel={() => setIsEditingResponse(false)}
        />
      )}

      {/* Image preview modal */}
      {previewImages && (
        <ImagePreviewModal
          images={previewImages}
          currentIndex={previewIndex}
          isOpen={true}
          onClose={handleClosePreview}
          onIndexChange={setPreviewIndex}
        />
      )}
    </div>
  );
};

export default ReviewCard;
