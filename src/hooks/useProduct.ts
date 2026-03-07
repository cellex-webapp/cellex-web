import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchProductById,
  fetchAllProducts,
  updateProduct,
  createProduct,
  deleteProductById,
  fetchProductsByShop,
  fetchMyProducts,
  searchProducts,
  fetchProductsByCategory,
  clearSelectedProduct,
  fetchProductComparison,
  clearCompareList,
  addToCompareList,
  removeFromCompareList
} from '@/stores/slices/product.slice';
import {
  selectAllProducts,
  selectSelectedProduct,
  selectProductIsLoading,
  selectProductError,
  selectProductPagination,
  selectComparisonData,
  selectIsComparing,
  selectCompareList
} from '@/stores/selectors/product.selector';

export const useProduct = () => {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectAllProducts);
  const selectedProduct = useAppSelector(selectSelectedProduct);
  const pagination = useAppSelector(selectProductPagination);
  const isLoading = useAppSelector(selectProductIsLoading);
  const error = useAppSelector(selectProductError);
  const comparisonData = useAppSelector(selectComparisonData);
  const isComparing = useAppSelector(selectIsComparing);

  const handleFetchById = useCallback((id: string) =>
    dispatch(fetchProductById(id)), [dispatch]);

  const handleFetchAll = useCallback((params?: IPaginationParams) =>
    dispatch(fetchAllProducts(params)), [dispatch]);

  const handleUpdate = useCallback((id: string, data: IUpdateProductPayload | FormData) =>
    dispatch(updateProduct({ id, data })), [dispatch]);

  const handleCreate = useCallback((data: ICreateProductPayload | FormData) =>
    dispatch(createProduct(data)), [dispatch]);

  const handleDelete = useCallback((id: string) =>
    dispatch(deleteProductById(id)), [dispatch]);

  const handleFetchByShop = useCallback((shopId: string, params?: IPaginationParams) =>
    dispatch(fetchProductsByShop({ shopId, params })), [dispatch]);

  const handleFetchMyProducts = useCallback((params?: IPaginationParams) =>
    dispatch(fetchMyProducts(params)), [dispatch]);

  const handleSearch = useCallback((keyword: string, params?: IPaginationParams) =>
    dispatch(searchProducts({ keyword, params })), [dispatch]);

  const handleFetchByCategory = useCallback((categoryId: string, params?: IPaginationParams) =>
    dispatch(fetchProductsByCategory({ categoryId, params })), [dispatch]);

  const handleClearSelected = useCallback(() =>
    dispatch(clearSelectedProduct()), [dispatch]);

  const handleCompare = useCallback((productIds: string[]) =>
    dispatch(fetchProductComparison(productIds)), [dispatch]);

  const compareList = useAppSelector(selectCompareList);
  const handleAddToCompare = useCallback((product: IProduct) => dispatch(addToCompareList(product)), [dispatch]);
  const handleRemoveFromCompare = useCallback((id: string) => dispatch(removeFromCompareList(id)), [dispatch]);
  const handleClearCompareList = useCallback(() => dispatch(clearCompareList()), [dispatch]);

  return {
    products,
    selectedProduct,
    pagination,
    isLoading,
    error,
    comparisonData,
    isComparing,
    compareList,
    addToCompareList: handleAddToCompare,
    removeFromCompareList: handleRemoveFromCompare,
    clearCompareList: handleClearCompareList,
    compareProducts: handleCompare,
    fetchProductById: handleFetchById,
    fetchAllProducts: handleFetchAll,
    updateProduct: handleUpdate,
    createProduct: handleCreate,
    deleteProduct: handleDelete,
    fetchProductsByShop: handleFetchByShop,
    fetchMyProducts: handleFetchMyProducts,
    searchProducts: handleSearch,
    fetchProductsByCategory: handleFetchByCategory,
    clearSelectedProduct: handleClearSelected,
  };
};