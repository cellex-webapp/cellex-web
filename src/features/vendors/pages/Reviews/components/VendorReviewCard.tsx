/**
 * Vendor Review Card Component
 * 
 * Displays a single review in the vendor's review management page.
 * Includes vendor response functionality and product/order detail modals.
 */

import React, { useState } from 'react';
import { Avatar, Rate, Tag, Button, Popconfirm, Image, Typography, Tooltip, Modal, Spin, Descriptions, Divider } from 'antd';
import {
  UserOutlined,
  CheckCircleFilled,
  MessageOutlined,
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  ShopOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { productService } from '@/services/product.service';
import { orderService } from '@/services/order.service';

const { Text, Paragraph, Title } = Typography;

interface VendorReviewCardProps {
  review: IReview;
  onRespond: (reviewId: string, comment: string) => Promise<void>;
  onDeleteResponse: (reviewId: string) => Promise<void>;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

/**
 * Format date to Vietnamese locale with relative time
 */
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Vừa xong' : `${diffMins} phút trước`;
    }
    return `${diffHours} giờ trước`;
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const VendorReviewCard: React.FC<VendorReviewCardProps> = ({
  review,
  onRespond,
  onDeleteResponse,
  isSubmitting = false,
  isDeleting = false,
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [responseText, setResponseText] = useState(review.vendor_response?.comment || '');
  
  // Product detail modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productDetail, setProductDetail] = useState<IProduct | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Order detail modal
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState<IOrder | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const hasResponse = !!review.vendor_response && !!review.vendor_response.comment;

  const handleSubmitResponse = async () => {
    const trimmedText = responseText.trim();
    
    // Validate response text
    if (!trimmedText || trimmedText.length < 10) {
      return;
    }
    
    try {
      await onRespond(review.id, trimmedText);
      setShowResponseForm(false);
      setIsEditing(false);
      setResponseText(''); // Clear the form
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteResponse = async () => {
    try {
      await onDeleteResponse(review.id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleStartEdit = () => {
    setResponseText(review.vendor_response?.comment || '');
    setIsEditing(true);
    setShowResponseForm(true);
  };

  const handleCancel = () => {
    setShowResponseForm(false);
    setIsEditing(false);
    setResponseText(review.vendor_response?.comment || '');
  };

  // Fetch product detail
  const handleViewProduct = async () => {
    setProductModalOpen(true);
    if (!productDetail) {
      setLoadingProduct(true);
      try {
        const response = await productService.getProductById(review.product_id);
        setProductDetail(response.result);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoadingProduct(false);
      }
    }
  };

  // Fetch order detail
  const handleViewOrder = async () => {
    setOrderModalOpen(true);
    if (!orderDetail) {
      setLoadingOrder(true);
      try {
        const response = await orderService.getOrderById(review.order_id);
        setOrderDetail(response.result);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoadingOrder(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Product & Order Info */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleViewProduct}
        >
          {review.product_image ? (
            <Image
              src={review.product_image}
              width={56}
              height={56}
              className="object-cover rounded-lg border border-gray-200"
              preview={false}
            />
          ) : (
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
              <ShoppingOutlined className="text-gray-400 text-xl" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Text 
            strong 
            className="text-gray-800 block truncate cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={handleViewProduct}
          >
            {review.product_name || 'Xem chi tiết sản phẩm'}
          </Text>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span 
              className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={handleViewOrder}
            >
              <FileTextOutlined />
              Đơn hàng: <span className="text-indigo-600">{review.order_id.slice(0, 8)}...</span>
              <EyeOutlined className="ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex items-start gap-3 flex-1">
          <Avatar
            size={48}
            src={review.user_avatar}
            icon={<UserOutlined />}
            className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text strong className="text-gray-800">
                {review.user_name}
              </Text>
              {review.is_verified_purchase && (
                <Tag
                  icon={<CheckCircleFilled />}
                  color="success"
                  className="!m-0 !text-xs"
                >
                  Đã mua hàng
                </Tag>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Rate
                disabled
                value={review.rating}
                className="text-sm !text-yellow-400"
              />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <ClockCircleOutlined />
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Response Status */}
        <div className="flex-shrink-0">
          {hasResponse ? (
            <Tag color="green" icon={<MessageOutlined />}>
              Đã phản hồi
            </Tag>
          ) : (
            <Tag color="orange" icon={<ClockCircleOutlined />}>
              Chờ phản hồi
            </Tag>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="mt-4">
        <Paragraph
          className="text-gray-700 mb-0"
          ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
        >
          {review.comment || <span className="text-gray-400 italic">Không có nội dung đánh giá</span>}
        </Paragraph>
      </div>

      {/* Media Gallery */}
      {((review.images && review.images.length > 0) || (review.videos && review.videos.length > 0)) && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex items-center gap-2">
              <PictureOutlined className="text-gray-400" />
              <Image.PreviewGroup>
                {review.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    width={64}
                    height={64}
                    className="object-cover rounded-lg border border-gray-200"
                    preview={{
                      maskClassName: 'rounded-lg',
                    }}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          )}

          {/* Videos */}
          {review.videos && review.videos.length > 0 && (
            <div className="flex items-center gap-2">
              <VideoCameraOutlined className="text-gray-400" />
              <Tag color="blue" className="!m-0">
                {review.videos.length} video
              </Tag>
            </div>
          )}
        </div>
      )}

      {/* Existing Vendor Response */}
      {hasResponse && !showResponseForm && (
        <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShopOutlined className="text-orange-500" />
              <Text strong className="text-orange-700">
                Phản hồi từ Shop
              </Text>
              {review.vendor_response?.createdAt && (
                <Text type="secondary" className="text-xs">
                  {review.vendor_response?.updatedAt
                    ? `Cập nhật: ${formatDate(review.vendor_response.updatedAt)}`
                    : formatDate(review.vendor_response.createdAt)}
                </Text>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined className="text-gray-500 hover:text-orange-500" />}
                  onClick={handleStartEdit}
                />
              </Tooltip>
              <Popconfirm
                title="Xóa phản hồi"
                description="Bạn có chắc muốn xóa phản hồi này?"
                onConfirm={handleDeleteResponse}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: isDeleting }}
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </div>
          </div>
          <Paragraph className="mt-2 mb-0 text-gray-700">
            {review.vendor_response?.comment}
          </Paragraph>
        </div>
      )}

      {/* Response Form */}
      {showResponseForm && (
        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShopOutlined className="text-indigo-600" />
            <Text strong className="text-indigo-700">
              {isEditing ? 'Chỉnh sửa phản hồi' : 'Viết phản hồi'}
            </Text>
          </div>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Nhập nội dung phản hồi của bạn..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-3">
            <Text type="secondary" className="text-xs">
              {responseText.length} / 500 ký tự
            </Text>
            <div className="flex items-center gap-2">
              <Button onClick={handleCancel} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleSubmitResponse}
                loading={isSubmitting}
                disabled={!responseText.trim() || responseText.trim().length < 10 || isSubmitting}
                className="!bg-indigo-600 hover:!bg-indigo-500"
              >
                {isEditing ? 'Cập nhật' : 'Gửi phản hồi'}
              </Button>
            </div>
          </div>
          {responseText.trim() && responseText.trim().length < 10 && (
            <Text type="danger" className="text-xs mt-1 block">
              Nội dung phải có ít nhất 10 ký tự
            </Text>
          )}
        </div>
      )}

      {/* Reply Button */}
      {!hasResponse && !showResponseForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            type="default"
            icon={<MessageOutlined />}
            onClick={() => setShowResponseForm(true)}
            className="border-indigo-300 text-indigo-600 hover:!border-indigo-500 hover:!text-indigo-700"
          >
            Trả lời đánh giá
          </Button>
        </div>
      )}

      {/* Product Detail Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <ShoppingOutlined className="text-indigo-600" />
            Chi tiết sản phẩm
          </span>
        }
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        footer={null}
        width={600}
      >
        {loadingProduct ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : productDetail ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              {productDetail.images?.[0] && (
                <Image
                  src={productDetail.images[0]}
                  width={120}
                  height={120}
                  className="object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <Title level={5} className="!mb-2">{productDetail.name}</Title>
                <div className="space-y-1 text-sm">
                  <div><Text type="secondary">Giá:</Text> <Text strong className="text-orange-600">{formatCurrency(productDetail.finalPrice || productDetail.price)}</Text></div>
                  {productDetail.saleOff && productDetail.saleOff > 0 && (
                    <div><Text type="secondary">Giảm giá:</Text> <Tag color="red">-{productDetail.saleOff}%</Tag></div>
                  )}
                  <div><Text type="secondary">Tồn kho:</Text> {productDetail.stockQuantity}</div>
                  <div><Text type="secondary">Đã bán:</Text> {productDetail.purchaseCount || 0}</div>
                  <div><Text type="secondary">Đánh giá TB:</Text> <Rate disabled value={productDetail.averageRating} className="text-xs" /> ({productDetail.reviewCount || 0})</div>
                </div>
              </div>
            </div>
            {productDetail.description && (
              <>
                <Divider className="!my-3" />
                <div>
                  <Text strong>Mô tả:</Text>
                  <Paragraph className="text-sm text-gray-600 mt-1" ellipsis={{ rows: 4, expandable: true }}>
                    {productDetail.description}
                  </Paragraph>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không thể tải thông tin sản phẩm
          </div>
        )}
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <FileTextOutlined className="text-indigo-600" />
            Chi tiết đơn hàng
          </span>
        }
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        footer={null}
        width={600}
      >
        {loadingOrder ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : orderDetail ? (
          <div className="space-y-4">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <Text copyable>{orderDetail.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={
                  orderDetail.status === 'DELIVERED' ? 'green' :
                  orderDetail.status === 'CANCELLED' ? 'red' :
                  orderDetail.status === 'SHIPPING' ? 'blue' : 'orange'
                }>
                  {orderDetail.status === 'PENDING' ? 'Chờ xác nhận' :
                   orderDetail.status === 'CONFIRMED' ? 'Đã xác nhận' :
                   orderDetail.status === 'SHIPPING' ? 'Đang giao' :
                   orderDetail.status === 'DELIVERED' ? 'Đã giao' :
                   orderDetail.status === 'CANCELLED' ? 'Đã hủy' : orderDetail.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {orderDetail.is_paid ? 
                  <Tag color="green">Đã thanh toán</Tag> : 
                  <Tag color="orange">Chưa thanh toán</Tag>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt" span={2}>
                {new Date(orderDetail.created_at).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            <Divider className="!my-3" />
            
            <div>
              <Text strong>Sản phẩm trong đơn:</Text>
              <div className="mt-2 space-y-2">
                {orderDetail.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    {item.product_image && (
                      <Image src={item.product_image} width={48} height={48} className="object-cover rounded" preview={false} />
                    )}
                    <div className="flex-1 min-w-0">
                      <Text className="block truncate">{item.product_name}</Text>
                      <Text type="secondary" className="text-xs">x{item.quantity}</Text>
                    </div>
                    <Text strong>{formatCurrency(item.subtotal)}</Text>
                  </div>
                ))}
              </div>
            </div>

            <Divider className="!my-3" />
            
            <div className="bg-blue-50 p-3 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <Text>Tạm tính:</Text>
                <Text>{formatCurrency(orderDetail.subtotal)}</Text>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <Text>Giảm giá:</Text>
                <Text>-{formatCurrency(orderDetail.discount_amount || 0)}</Text>
              </div>
              <div className="flex justify-between text-sm">
                <Text>Phí vận chuyển:</Text>
                <Text>{formatCurrency(orderDetail.shipping_fee || 0)}</Text>
              </div>
              <Divider className="!my-2" />
              <div className="flex justify-between font-bold">
                <Text strong>Tổng cộng:</Text>
                <Text strong className="text-lg text-blue-600">{formatCurrency(orderDetail.total_amount)}</Text>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không thể tải thông tin đơn hàng
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorReviewCard;
