/**
 * ReviewForm Component
 * 
 * A comprehensive form for creating or updating product reviews.
 * Supports:
 * - Star rating selection
 * - Comment text input
 * - Image upload (up to 5)
 * - Video upload (up to 2)
 * - Form validation
 * - Submission status display
 */

import React, { useState, useCallback, useRef } from 'react';
import { Button, message, Modal } from 'antd';
import { StarRatingInput } from './StarRating';

interface ReviewFormProps {
  /** Order ID (required for new reviews) */
  orderId?: string;
  /** Product ID (required for new reviews) */
  productId?: string;
  /** Existing review data (for update mode) */
  existingReview?: IReview;
  /** Product name to display */
  productName?: string;
  /** Product image to display */
  productImage?: string;
  /** Loading state */
  isSubmitting?: boolean;
  /** Callback when form is submitted */
  onSubmit: (data: ICreateReviewRequest | IUpdateReviewRequest) => Promise<void>;
  /** Callback when form is canceled */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maximum file sizes
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGES = 5;
const MAX_VIDEOS = 2;

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ReviewForm: React.FC<ReviewFormProps> = ({
  orderId,
  productId,
  existingReview,
  productName,
  productImage,
  isSubmitting = false,
  onSubmit,
  onCancel,
  className = '',
}) => {
  const isUpdateMode = !!existingReview;
  
  // Form state
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [videos, setVideos] = useState<string[]>(existingReview?.videos || []);
  
  // Temporary files for preview (before upload)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate form before submission
   */
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }

    if (!isUpdateMode && !orderId) {
      newErrors.orderId = 'Thiếu thông tin đơn hàng';
    }

    if (!isUpdateMode && !productId) {
      newErrors.productId = 'Thiếu thông tin sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rating, orderId, productId, isUpdateMode]);

  /**
   * Handle image file selection
   */
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check count limit
    const totalImages = images.length + imageFiles.length + files.length;
    if (totalImages > MAX_IMAGES) {
      message.error(`Chỉ được tải tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        message.error(`${file.name} không phải là ảnh`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        message.error(`${file.name} vượt quá ${formatFileSize(MAX_IMAGE_SIZE)}`);
        continue;
      }
      validFiles.push(file);
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [images.length, imageFiles.length]);

  /**
   * Handle video file selection
   */
  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check count limit
    const totalVideos = videos.length + videoFiles.length + files.length;
    if (totalVideos > MAX_VIDEOS) {
      message.error(`Chỉ được tải tối đa ${MAX_VIDEOS} video`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('video/')) {
        message.error(`${file.name} không phải là video`);
        continue;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        message.error(`${file.name} vượt quá ${formatFileSize(MAX_VIDEO_SIZE)}`);
        continue;
      }
      validFiles.push(file);
    }

    setVideoFiles(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, [videos.length, videoFiles.length]);

  /**
   * Remove an existing image URL
   */
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Remove a pending image file
   */
  const removeImageFile = useCallback((index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Remove an existing video URL
   */
  const removeVideo = useCallback((index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Remove a pending video file
   */
  const removeVideoFile = useCallback((index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      // In a real app, you would upload files first and get URLs
      // For now, we'll create object URLs as placeholders
      const newImageUrls = imageFiles.map(file => URL.createObjectURL(file));
      const newVideoUrls = videoFiles.map(file => URL.createObjectURL(file));

      const allImages = [...images, ...newImageUrls];
      const allVideos = [...videos, ...newVideoUrls];

      if (isUpdateMode) {
        // Update mode - only send review data
        const updateData: IUpdateReviewRequest = {
          rating,
          comment: comment.trim() || undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
        };
        await onSubmit(updateData);
      } else {
        // Create mode - include order and product IDs
        const createData: ICreateReviewRequest = {
          order_id: orderId!,
          product_id: productId!,
          rating,
          comment: comment.trim() || undefined,
          images: allImages.length > 0 ? allImages : undefined,
          videos: allVideos.length > 0 ? allVideos : undefined,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      // Error handling is done in parent
    }
  }, [
    validateForm,
    imageFiles,
    videoFiles,
    images,
    videos,
    isUpdateMode,
    rating,
    comment,
    orderId,
    productId,
    onSubmit,
  ]);

  /**
   * Show confirmation before cancel if form has changes
   */
  const handleCancel = useCallback(() => {
    const hasChanges = rating !== (existingReview?.rating || 0) ||
      comment !== (existingReview?.comment || '') ||
      imageFiles.length > 0 ||
      videoFiles.length > 0;

    if (hasChanges) {
      Modal.confirm({
        title: 'Hủy đánh giá',
        content: 'Bạn có chắc muốn hủy? Những thay đổi chưa lưu sẽ bị mất.',
        okText: 'Hủy đánh giá',
        cancelText: 'Tiếp tục chỉnh sửa',
        okButtonProps: { danger: true },
        onOk: onCancel,
      });
    } else {
      onCancel?.();
    }
  }, [rating, comment, imageFiles.length, videoFiles.length, existingReview, onCancel]);

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isUpdateMode ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
        </h3>
        {onCancel && (
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Product info (if provided) */}
      {(productName || productImage) && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          {productName && (
            <span className="text-sm font-medium text-gray-900 line-clamp-2">
              {productName}
            </span>
          )}
        </div>
      )}

      {/* Rating selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chất lượng sản phẩm <span className="text-red-500">*</span>
        </label>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          error={errors.rating}
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhận xét của bạn
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          maxLength={1000}
        />
        <div className="mt-1 text-xs text-gray-500 text-right">
          {comment.length} / 1000 ký tự
        </div>
      </div>

      {/* Image upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thêm hình ảnh ({images.length + imageFiles.length}/{MAX_IMAGES})
        </label>
        
        <div className="flex flex-wrap gap-2">
          {/* Existing images */}
          {images.map((url, index) => (
            <div key={`existing-${index}`} className="relative w-20 h-20">
              <img
                src={url}
                alt={`Ảnh ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Xóa ảnh"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Pending image files */}
          {imageFiles.map((file, index) => (
            <div key={`file-${index}`} className="relative w-20 h-20">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImageFile(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Xóa ảnh"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add image button */}
          {images.length + imageFiles.length < MAX_IMAGES && (
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs mt-1">Thêm ảnh</span>
            </button>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <p className="mt-2 text-xs text-gray-500">
          Tối đa {MAX_IMAGES} ảnh, mỗi ảnh không quá {formatFileSize(MAX_IMAGE_SIZE)}
        </p>
      </div>

      {/* Video upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thêm video ({videos.length + videoFiles.length}/{MAX_VIDEOS})
        </label>
        
        <div className="flex flex-wrap gap-2">
          {/* Existing videos */}
          {videos.map((url, index) => (
            <div key={`existing-${index}`} className="relative w-32 h-20">
              <video
                src={url}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
                preload="metadata"
              />
              <button
                onClick={() => removeVideo(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Xóa video"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Pending video files */}
          {videoFiles.map((file, index) => (
            <div key={`file-${index}`} className="relative w-32 h-20">
              <video
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover rounded-lg border border-gray-200"
                preload="metadata"
              />
              <button
                onClick={() => removeVideoFile(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Xóa video"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add video button */}
          {videos.length + videoFiles.length < MAX_VIDEOS && (
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">Thêm video</span>
            </button>
          )}
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoSelect}
          className="hidden"
        />
        <p className="mt-2 text-xs text-gray-500">
          Tối đa {MAX_VIDEOS} video, mỗi video không quá {formatFileSize(MAX_VIDEO_SIZE)}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            onClick={handleCancel}
            disabled={isSubmitting}
            size="large"
          >
            Hủy
          </Button>
        )}
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={rating === 0}
          size="large"
          className="!bg-indigo-600 hover:!bg-indigo-700 min-w-[120px]"
        >
          {isUpdateMode ? 'Cập nhật' : 'Gửi đánh giá'}
        </Button>
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <span className="font-medium">Lưu ý:</span> Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị.
          Vui lòng đảm bảo nội dung phù hợp và không vi phạm quy định cộng đồng.
        </p>
      </div>
    </div>
  );
};

export default ReviewForm;
