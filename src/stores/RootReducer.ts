import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/stores/slices/auth.slice';
import userReducer from '@/stores/slices/user.slice';
import categoryReducer from '@/stores/slices/category.slice';
import shopReducer from '@/stores/slices/shop.slice';
import attributeReducer from '@/stores/slices/attribute.slice';
import productReducer from '@/stores/slices/product.slice';
import cartReducer from '@/stores/slices/cart.slice';
import couponReducer from '@/stores/slices/coupon.slice';
import segmentReducer from '@/stores/slices/segment.slice';
import segmentCouponReducer from '@/stores/slices/segmentCoupon.slice';
import orderReducer from '@/stores/slices/order.slice';
import notificationReducer from '@/stores/slices/notification.slice';
import vnpayReducer from '@/stores/slices/vnpay.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  category: categoryReducer,
  cart: cartReducer,
  coupon: couponReducer,
  shop: shopReducer,
  attribute: attributeReducer,
  product: productReducer,
  segment: segmentReducer,
  segmentCoupon: segmentCouponReducer,
  order: orderReducer,
  notification: notificationReducer,
  vnpay: vnpayReducer,
});

export default rootReducer;