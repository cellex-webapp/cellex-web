import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/stores/slices/auth.slice';
import userReducer from '@/stores/slices/user.slice';
import categoryReducer from '@/stores/slices/category.slice';
import shopReducer from '@/stores/slices/shop.slice';
import attributeReducer from '@/stores/slices/attribute.slice';
import productReducer from '@/stores/slices/product.slice';
import cartReducer from '@/stores/slices/cart.slice';
import couponReducer from '@/stores/slices/coupon.slice';
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  category: categoryReducer,
  cart: cartReducer,
  coupon: couponReducer,
  shop: shopReducer,
  attribute: attributeReducer,
  product: productReducer,
});

export default rootReducer;