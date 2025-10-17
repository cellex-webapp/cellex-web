import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/stores/slices/auth.slice';
import userReducer from '@/stores/slices/user.slice';
import categoryReducer from '@/stores/slices/category.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  category: categoryReducer,
});

export default rootReducer;