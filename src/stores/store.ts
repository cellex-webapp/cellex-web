import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './RootReducer';
import { shopApi } from './api/shopApi.slice';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(shopApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
