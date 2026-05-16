import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  clearThemeState,
} from '@/stores/slices/shopTheme.slice';
import {
  selectTheme,
  selectThemeIsLoading,
  selectThemeError,
} from '@/stores/selectors/shopTheme.selector';

export const useShopTheme = () => {
  const dispatch = useAppDispatch();

  const theme = useAppSelector(selectTheme);
  const isLoading = useAppSelector(selectThemeIsLoading);
  const error = useAppSelector(selectThemeError);

  const handleFetchTheme = useCallback(
    (shopId: string) => dispatch(fetchTheme(shopId)),
    [dispatch]
  );

  const handleCreateTheme = useCallback(
    (shopId: string, payload: ICreateThemePayload) => dispatch(createTheme({ shopId, payload })),
    [dispatch]
  );

  const handleUpdateTheme = useCallback(
    (shopId: string, payload: IUpdateThemePayload) => dispatch(updateTheme({ shopId, payload })),
    [dispatch]
  );

  const handleDeleteTheme = useCallback(
    (shopId: string) => dispatch(deleteTheme(shopId)),
    [dispatch]
  );

  const handleClearThemeState = useCallback(
    () => dispatch(clearThemeState()),
    [dispatch]
  );

  return {
    theme,
    isLoading,
    error,
    fetchTheme: handleFetchTheme,
    createTheme: handleCreateTheme,
    updateTheme: handleUpdateTheme,
    deleteTheme: handleDeleteTheme,
    clearThemeState: handleClearThemeState,
  };
};

export default useShopTheme;
