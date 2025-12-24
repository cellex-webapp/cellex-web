/**
 * My Reviews Page
 * 
 * Displays all reviews created by the current logged-in user.
 * Shows reviews in all statuses with appropriate badges and information.
 * Supports pagination, editing, and navigation to product details.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { 
  Card, 
  Empty, 
  Spin, 
  message, 
  Pagination, 
  Typography, 
  Space,
  Alert,
  Button,
  Modal,
  Input,
  Drawer,
  Descriptions,
  Image
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  ShoppingOutlined,
  ArrowRightOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '@/services/review.service';
import { shopService } from '@/services/shop.service';
import { formatDateVN } from '@/utils/date';
import { StarRating } from '@/features/clients/components/Review/StarRating';
import { ImagePreviewModal } from '@/features/clients/components/Review/ImagePreviewModal';
import { ReviewForm } from '@/features/clients/components/Review/ReviewForm';
import axiosInstance from '@/utils/axiosInstance';

const { Title, Text, Paragraph } = Typography;

/**
 * Status badge configuration
 */
const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { color: string; label: string }> = {
  PENDING_MODERATION: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Đang kiểm duyệt'
  },
  APPROVED: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Đã hiển thị'
  },
  APPROVED_BY_ADMIN: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Đã hiển thị'
  },
  REJECTED_AUTO: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Bị từ chối'
  },
  REJECTED_BY_ADMIN: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Bị từ chối'
  },
  HIDDEN: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Đã ẩn'
  }
};

/**
 * Review Status Badge Component
 */
const ReviewStatusBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => {
  const config = REVIEW_STATUS_CONFIG[status];
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

/**
 * Video Preview Component
 */
const VideoPreview: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
      <video
        src={url}
        controls
        className="h-full w-full object-cover"
        preload="metadata"
      >
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
  );
};

/**
 * Rejection Info Alert Component
 */
const RejectionInfo: React.FC<{ review: IReview }> = ({ review }) => {
  if (!['REJECTED_AUTO', 'REJECTED_BY_ADMIN', 'HIDDEN'].includes(review.status)) {
    return null;
  }

  const isRejected = review.status === 'REJECTED_AUTO' || review.status === 'REJECTED_BY_ADMIN';

  return (
    <Alert
      type={isRejected ? 'error' : 'warning'}
      showIcon
      message={isRejected ? 'Đánh giá bị từ chối' : 'Đánh giá đã bị ẩn'}
      description={
        <div className="space-y-2">
          {review.rejection_reason && (
            <p className="text-sm">
              <strong>Lý do:</strong> {review.rejection_reason}
            </p>
          )}
          
          {review.flagged_categories_vi && review.flagged_categories_vi.length > 0 && (
            <p className="text-sm">
              <strong>Nội dung vi phạm:</strong> {review.flagged_categories_vi.join(', ')}
            </p>
          )}
          
          {review.admin_decision && (
            <div className="text-sm space-y-1">
              <p>
                <strong>Người quyết định:</strong> {review.admin_decision.admin_name}
              </p>
              {review.admin_decision.reason && (
                <p>
                  <strong>Ghi chú từ quản trị viên:</strong> {review.admin_decision.reason}
                </p>
              )}
              <p className="text-gray-500">
                {formatDateVN(review.admin_decision.decided_at)}
              </p>
            </div>
          )}
          
          <p className="text-sm mt-2">
            {isRejected ? '⚠️ Đánh giá này không hiển thị công khai.' : '⚠️ Đánh giá này đã bị ẩn và không hiển thị công khai.'}
          </p>
        </div>
      }
      className="mb-4"
    />
  );
};

/**
 * Individual Review Card Component
 */
const MyReviewCard: React.FC<{
  review: IReview;
  productInfo: { name: string; image: string; shop_name: string; shop_avatar: string; shop_id: string } | null;
  onEdit: (review: IReview) => void;
  onViewProduct: (productId: string) => void;
  onViewShop: (shopId: string) => void;
  onDelete: (reviewId: string) => void;
}> = ({ review, productInfo, onEdit, onViewProduct, onViewShop, onDelete }) => {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const canEdit = review.status !== 'PENDING_MODERATION';

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setImagePreviewOpen(true);
  };

  return (
    <Card
      className="mb-4 hover:shadow-lg transition-shadow duration-200"
      bordered={false}
    >
      {/* Rejection/Hidden Info */}
      <RejectionInfo review={review} />

      {/* Header: Product Info + Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Product Image */}
          <button
            onClick={() => onViewProduct(review.product_id)}
            className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 hover:opacity-75 transition-opacity"
          >
            {productInfo?.image ? (
              <img
                src={productInfo.image}
                alt={productInfo.name || 'Product'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingOutlined className="text-2xl text-gray-400" />
              </div>
            )}
          </button>
          
          {/* Product Name */}
          <div className="flex-1 min-w-0">
            <button
              onClick={() => onViewProduct(review.product_id)}
              className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-left"
            >
              {productInfo?.name || 'Đang tải...'}
            </button>
            
            {/* Shop Info */}
            {productInfo && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => productInfo.shop_id && onViewShop(productInfo.shop_id)}
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                  disabled={!productInfo.shop_id}
                >
                  {/* Shop Avatar */}
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {productInfo.shop_avatar ? (
                      <img
                        src={productInfo.shop_avatar}
                        alt={productInfo.shop_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingOutlined className="text-xs text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Shop Name */}
                  <span className="text-xs text-gray-600 hover:text-blue-600 transition-colors">
                    {productInfo.shop_name}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        <ReviewStatusBadge status={review.status} />
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating value={review.rating} readonly size="lg" />
      </div>

      {/* Comment */}
      {review.comment && (
        <Paragraph className="mb-4 text-gray-700">
          {review.comment}
        </Paragraph>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {review.images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:opacity-75 transition-opacity"
            >
              <img
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Videos */}
      {review.videos && review.videos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {review.videos.map((video, index) => (
            <VideoPreview key={index} url={video} />
          ))}
        </div>
      )}

      {/* Vendor Response */}
      {review.vendor_response && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <ShoppingOutlined className="text-white text-sm" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Text strong className="text-sm">
                  {review.vendor_response.vendor_name}
                </Text>
                <Text type="secondary" className="text-xs">
                  đã phản hồi
                </Text>
              </div>
              <Paragraph className="mb-2 text-gray-700">
                {review.vendor_response.comment}
              </Paragraph>
              <Text type="secondary" className="text-xs">
                {formatDateVN(review.vendor_response.created_at)}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {review.is_verified_purchase && (
            <span className="flex items-center gap-1 text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Đã mua hàng
            </span>
          )}
          <span>Đăng: {formatDateVN(review.created_at)}</span>
          {review.updated_at && review.updated_at !== review.created_at && (
            <span>Sửa: {formatDateVN(review.updated_at)}</span>
          )}
          {review.helpful_count !== undefined && review.helpful_count > 0 && (
            <span>{review.helpful_count} người thấy hữu ích</span>
          )}
        </div>

        <Space>
          <Button
            type="link"
            icon={<ShoppingOutlined />}
            onClick={() => onViewProduct(review.product_id)}
            size="small"
          >
            Xem sản phẩm
          </Button>
          
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(review)}
            disabled={!canEdit}
            size="small"
          >
            Chỉnh sửa
          </Button>
          
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(review.id)}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      </div>

      {/* Image Preview Modal */}
      {review.images && review.images.length > 0 && (
        <ImagePreviewModal
          images={review.images}
          isOpen={imagePreviewOpen}
          currentIndex={currentImageIndex}
          onClose={() => setImagePreviewOpen(false)}
        />
      )}
    </Card>
  );
};

/**
 * Main My Reviews Page Component
 */
const MyReviews: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'ALL'>('ALL');
  
  // Product info cache
  const [productInfoMap, setProductInfoMap] = useState<Map<string, { name: string; image: string; shop_name: string; shop_avatar: string; shop_id: string }>>(new Map());
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<IReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Product detail drawer state
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productDetail, setProductDetail] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  /**
   * Fetch reviews from API
   */
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewService.getMyReviews({
        page: currentPage,
        limit: pageSize,
        sortBy: 'createdAt',
        sortType: 'desc'
      });

      if (response.result) {
        setReviews(response.result.content);
        setTotalElements(response.result.totalElements);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  /**
   * Load reviews on mount and when pagination changes
   */
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /**
   * Fetch product information for reviews
   */
  useEffect(() => {
    const fetchProductInfo = async () => {
      const productIds = [...new Set(reviews.map(r => r.product_id))];
      const newProductInfo = new Map(productInfoMap);
      
      for (const productId of productIds) {
        if (!newProductInfo.has(productId)) {
          try {
            const response = await axiosInstance.get(`/products/${productId}`);
            if (response.data.result) {
              const product = response.data.result;
              console.log('Product data for', productId, ':', product);
              
              // Fetch shop details if shopId exists
              let shopData = null;
              if (product.shopId) {
                try {
                  const shopResponse = await shopService.getShopById(product.shopId);
                  console.log('Shop data:', shopResponse.result);
                  shopData = shopResponse.result;
                } catch (shopError: any) {
                  console.error('Failed to fetch shop data:', shopError?.response?.data || shopError.message);
                }
              }
              
              newProductInfo.set(productId, {
                name: product.name,
                image: product.images?.[0] || '',
                shop_name: shopData?.shop_name || 'Shop',
                shop_avatar: shopData?.logo_url || '',
                shop_id: product.shopId || ''
              });
            }
          } catch (error) {
            // Silent fail - keep placeholder
            newProductInfo.set(productId, {
              name: 'Sản phẩm',
              image: '',
              shop_name: 'Shop',
              shop_avatar: '',
              shop_id: ''
            });
          }
        }
      }
      
      setProductInfoMap(newProductInfo);
    };

    if (reviews.length > 0) {
      fetchProductInfo();
    }
  }, [reviews]);

  /**
   * Filter reviews based on search term and status
   */
  const filteredReviews = reviews.filter(review => {
    // Status filter
    if (statusFilter !== 'ALL' && review.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        review.comment?.toLowerCase().includes(term) ||
        review.product_id.toLowerCase().includes(term)
      );
    }

    return true;
  });

  /**
   * Handle delete review - Open confirmation modal
   */
  const handleDeleteReview = (reviewId: string) => {
    console.log('Delete review clicked:', reviewId);
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  /**
   * Confirm delete review
   */
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    setIsDeleting(true);
    try {
      console.log('Deleting review:', reviewToDelete);
      await reviewService.deleteReview(reviewToDelete);
      message.success('Đã xóa đánh giá thành công');
      setDeleteModalOpen(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (error: any) {
      console.error('Delete error:', error);
      message.error(error?.response?.data?.message || 'Không thể xóa đánh giá');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle edit review
   */
  const handleEditReview = (review: IReview) => {
    setReviewToEdit(review);
    setEditModalOpen(true);
  };

  /**
   * Handle submit edit
   */
  const handleSubmitEdit = async (data: IUpdateReviewRequest) => {
    if (!reviewToEdit) return;

    setIsSubmitting(true);
    try {
      await reviewService.updateReview(reviewToEdit.id, data);
      message.success('Đánh giá đã được cập nhật. Đánh giá sẽ được kiểm duyệt lại.');
      setEditModalOpen(false);
      setReviewToEdit(null);
      fetchReviews();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể cập nhật đánh giá');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Fetch product detail
   */
  const fetchProductDetail = async (productId: string) => {
    setLoadingProduct(true);
    try {
      const response = await axiosInstance.get(`/products/${productId}`);
      setProductDetail(response.data.result);
    } catch (error: any) {
      message.error('Không thể tải thông tin sản phẩm');
    } finally {
      setLoadingProduct(false);
    }
  };

  /**
   * Handle view product - Open drawer instead of navigate
   */
  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setProductDrawerOpen(true);
    fetchProductDetail(productId);
  };

  /**
   * Handle view shop - Navigate to shop detail page
   */
  const handleViewShop = (shopId: string) => {
    navigate(`/shops/${shopId}`);
  };

  /**
   * Handle navigate to product detail page
   */
  const handleNavigateToProduct = () => {
    if (selectedProductId) {
      navigate(`/product/${selectedProductId}`);
    }
  };

  /**
   * Handle pagination change
   */
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Title level={3} className="!mb-2">
          Đánh giá của tôi
        </Title>
        <Text type="secondary">
          Quản lý tất cả đánh giá sản phẩm của bạn
        </Text>
      </div>

      {/* Filters */}
      <Card className="mb-4" bordered={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm theo nội dung..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
            className="flex-1"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ReviewStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING_MODERATION">Đang kiểm duyệt</option>
            <option value="APPROVED">Đã hiển thị</option>
            <option value="APPROVED_BY_ADMIN">Đã hiển thị (Admin)</option>
            <option value="REJECTED_AUTO">Bị từ chối</option>
            <option value="REJECTED_BY_ADMIN">Bị từ chối (Admin)</option>
            <option value="HIDDEN">Đã ẩn</option>
          </select>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Đang tải đánh giá..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredReviews.length === 0 && (
        <Card className="text-center py-12">
          <Empty
            description={
              searchTerm || statusFilter !== 'ALL' 
                ? 'Không tìm thấy đánh giá phù hợp' 
                : 'Bạn chưa có đánh giá nào'
            }
          >
            {!searchTerm && statusFilter === 'ALL' && (
              <Button
                type="primary"
                onClick={() => navigate('/account?tab=orders')}
                className="mt-4"
              >
                Xem đơn hàng đã giao
              </Button>
            )}
          </Empty>
        </Card>
      )}

      {/* Reviews List */}
      {!loading && filteredReviews.length > 0 && (
        <>
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <MyReviewCard
                key={review.id}
                review={review}
                productInfo={productInfoMap.get(review.product_id) || null}
                onEdit={handleEditReview}
                onViewProduct={handleViewProduct}
                onViewShop={handleViewShop}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalElements}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={total => `Tổng ${total} đánh giá`}
              pageSizeOptions={['5', '10', '20', '50']}
            />
          </div>
        </>
      )}

      {/* Edit Review Modal */}
      <Modal
        title="Chỉnh sửa đánh giá"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setReviewToEdit(null);
        }}
        footer={null}
        width={700}
        centered
        destroyOnClose
      >
        {reviewToEdit && (
          <div className="space-y-4">
            <Alert
              type="info"
              message="Lưu ý"
              description="Sau khi chỉnh sửa, đánh giá của bạn sẽ được kiểm duyệt lại trước khi hiển thị công khai."
              showIcon
              className="mb-4"
            />

            <ReviewForm
              existingReview={reviewToEdit}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitEdit}
              onCancel={() => {
                setEditModalOpen(false);
                setReviewToEdit(null);
              }}
            />
          </div>
        )}
      </Modal>

      {/* Product Detail Drawer */}
      <Drawer
        title="Thông tin sản phẩm"
        placement="right"
        width={600}
        open={productDrawerOpen}
        onClose={() => {
          setProductDrawerOpen(false);
          setSelectedProductId(null);
          setProductDetail(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setProductDrawerOpen(false)}>
              Đóng
            </Button>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={handleNavigateToProduct}
            >
              Xem chi tiết sản phẩm
            </Button>
          </div>
        }
      >
        {loadingProduct ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : productDetail ? (
          <div className="space-y-6">
            {/* Product Images */}
            {productDetail.images && productDetail.images.length > 0 && (
              <div className="space-y-2">
                <Image.PreviewGroup>
                  <div className="grid grid-cols-2 gap-2">
                    {productDetail.images.slice(0, 4).map((img: string, idx: number) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`${productDetail.name} ${idx + 1}`}
                        className="rounded-lg object-cover aspect-square"
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}

            {/* Product Info */}
            <div>
              <Title level={4} className="!mb-2">
                {productDetail.name}
              </Title>
              <Text className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(productDetail.finalPrice || productDetail.originalPrice)}
              </Text>
              {productDetail.finalPrice < productDetail.originalPrice && (
                <Text delete type="secondary" className="ml-2">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(productDetail.originalPrice)}
                </Text>
              )}
            </div>

            {/* Descriptions */}
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Danh mục">
                {productDetail.category?.name || 'Chưa phân loại'}
              </Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">
                {productDetail.brand || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho">
                {productDetail.stockQuantity > 0 ? (
                  <span className="text-green-600">Còn {productDetail.stockQuantity} sản phẩm</span>
                ) : (
                  <span className="text-red-600">Hết hàng</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá">
                <Space>
                  <StarRating value={productDetail.averageRating || 0} readonly size="sm" />
                  <Text type="secondary">
                    ({productDetail.reviewCount || 0} đánh giá)
                  </Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {/* Description */}
            {productDetail.description && (
              <div>
                <Title level={5}>Mô tả sản phẩm</Title>
                <Paragraph className="text-gray-600">
                  {productDetail.description}
                </Paragraph>
              </div>
            )}

            {/* Shop Info */}
            {productDetail.shop && (
              <div className="bg-gray-50 rounded-lg p-4">
                <Title level={5} className="!mb-2">
                  Thông tin cửa hàng
                </Title>
                <Space direction="vertical" size="small">
                  <Text strong>{productDetail.shop.shop_name}</Text>
                  {productDetail.shop.address && (
                    <Text type="secondary" className="text-sm">
                      📍 {productDetail.shop.address}
                    </Text>
                  )}
                </Space>
              </div>
            )}
          </div>
        ) : (
          <Empty description="Không có thông tin sản phẩm" />
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xóa đánh giá?"
        open={deleteModalOpen}
        onOk={confirmDeleteReview}
        onCancel={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: isDeleting }}
        cancelButtonProps={{ disabled: isDeleting }}
      >
        <p>Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default MyReviews;
