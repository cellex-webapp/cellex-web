/**
 * VendorResponseForm Component
 * 
 * A form component for vendors to add or edit their response to a review.
 * Only visible to shop owners.
 */

import React, { useState, useCallback } from 'react';
import { Button } from 'antd';

interface VendorResponseFormProps {
  /** Existing response content (for edit mode) */
  initialValue?: string;
  /** Loading state */
  isSubmitting?: boolean;
  /** Callback when submitting response */
  onSubmit: (comment: string) => Promise<void>;
  /** Callback when canceling */
  onCancel?: () => void;
  /** Whether this is edit mode */
  isEditMode?: boolean;
}

export const VendorResponseForm: React.FC<VendorResponseFormProps> = ({
  initialValue = '',
  isSubmitting = false,
  onSubmit,
  onCancel,
  isEditMode = false,
}) => {
  const [comment, setComment] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    // Validate
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError('Vui lòng nhập nội dung phản hồi');
      return;
    }

    if (trimmedComment.length < 10) {
      setError('Nội dung phản hồi phải có ít nhất 10 ký tự');
      return;
    }

    setError(null);

    try {
      await onSubmit(trimmedComment);
      // Reset form after successful submission (only for new responses)
      if (!isEditMode) {
        setComment('');
      }
    } catch (err) {
      // Error handling is done in parent
    }
  }, [comment, onSubmit, isEditMode]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    setComment(initialValue);
    setError(null);
    onCancel?.();
  }, [initialValue, onCancel]);

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
        <span className="font-medium text-gray-900">
          {isEditMode ? 'Chỉnh sửa phản hồi' : 'Phản hồi đánh giá'}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          if (error) setError(null);
        }}
        placeholder="Nhập nội dung phản hồi của bạn..."
        rows={3}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        disabled={isSubmitting}
      />

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Character count */}
      <div className="mt-1 text-xs text-gray-500 text-right">
        {comment.length} / 500 ký tự
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 mt-3">
        {onCancel && (
          <Button
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        )}
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          className="!bg-orange-500 hover:!bg-orange-600"
        >
          {isEditMode ? 'Cập nhật' : 'Gửi phản hồi'}
        </Button>
      </div>
    </div>
  );
};

/**
 * VendorResponseDisplay Component
 * 
 * Displays an existing vendor response with edit/delete options for the owner.
 */
interface VendorResponseDisplayProps {
  /** Vendor response data */
  response: IVendorResponse;
  /** Whether current user can edit this response */
  canEdit?: boolean;
  /** Loading state for delete action */
  isDeleting?: boolean;
  /** Callback for edit action */
  onEdit?: () => void;
  /** Callback for delete action */
  onDelete?: () => void;
}

export const VendorResponseDisplay: React.FC<VendorResponseDisplayProps> = ({
  response,
  canEdit = false,
  isDeleting = false,
  onEdit,
  onDelete,
}) => {
  /**
   * Format date to Vietnamese locale
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-4 mt-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
          <span className="font-medium text-orange-700">Phản hồi từ Shop</span>
          <span className="text-xs text-gray-500">
            {response.vendor_name}
          </span>
        </div>

        {/* Edit/Delete buttons */}
        {canEdit && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-500 hover:text-orange-600 transition-colors"
                aria-label="Chỉnh sửa"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                aria-label="Xóa"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Response content */}
      <p className="text-gray-700 text-sm whitespace-pre-line">
        {response.comment}
      </p>

      {/* Date */}
      <div className="mt-2 text-xs text-gray-500">
        {formatDate(response.created_at)}
        {response.updated_at && response.updated_at !== response.created_at && (
          <span className="ml-2">(đã chỉnh sửa)</span>
        )}
      </div>
    </div>
  );
};

export default VendorResponseForm;
