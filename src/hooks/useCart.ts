import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchMyCart,
  addToCart,
  updateCartQuantity,
  setCartQuantity,
  removeFromCart,
  clearCart,
  clearCartOnLogout,
} from '@/stores/slices/cart.slice';
import {
  selectCart,
  selectCartItems,
  selectCartIsLoading,
  selectCartError,
  selectTotalCartItemCount,
  selectCartTotalPrice,
} from '@/stores/selectors/cart.selector';

export const useCart = () => {
  const dispatch = useAppDispatch();

  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const isLoading = useAppSelector(selectCartIsLoading);
  const error = useAppSelector(selectCartError);
  const totalItems = useAppSelector(selectTotalCartItemCount);
  const totalPrice = useAppSelector(selectCartTotalPrice);

  const handleFetchMyCart = useCallback(() => dispatch(fetchMyCart()), [dispatch]);
  const handleAddToCart = useCallback((payload: IAddToCartRequest) => dispatch(addToCart(payload)), [dispatch]);
  const handleUpdateQuantity = useCallback((payload: IUpdateCartItemQuantityRequest) => dispatch(updateCartQuantity(payload)), [dispatch]);
  const handleSetQuantity = useCallback((payload: ISetCartItemQuantityRequest) => dispatch(setCartQuantity(payload)), [dispatch]);
  const handleRemoveFromCart = useCallback((payload: IRemoveFromCartRequest) => dispatch(removeFromCart(payload)), [dispatch]);
  const handleClearCart = useCallback(() => dispatch(clearCart()), [dispatch]);
  const handleClearCartOnLogout = useCallback(() => dispatch(clearCartOnLogout()), [dispatch]);

  return {
    cart,
    items,
    isLoading,
    error,
    totalItems,
    totalPrice,
    fetchMyCart: handleFetchMyCart,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    setQuantity: handleSetQuantity,
    removeFromCart: handleRemoveFromCart,
    clearCart: handleClearCart,
    clearCartOnLogout: handleClearCartOnLogout,
  };
};