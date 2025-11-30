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
} from '@/stores/slices/product.slice';
import {
  selectAllProducts,
  selectSelectedProduct,
  selectProductIsLoading,
  selectProductError,
  selectProductPagination,
} from '@/stores/selectors/product.selector';

export const useProduct = () => {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectAllProducts);
  const selectedProduct = useAppSelector(selectSelectedProduct);
  const pagination = useAppSelector(selectProductPagination); 
  const isLoading = useAppSelector(selectProductIsLoading);
  const error = useAppSelector(selectProductError);

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

  return {
    products,
    selectedProduct,
    pagination,
    isLoading,
    error,
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