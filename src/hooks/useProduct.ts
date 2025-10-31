import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
    fetchProductById,
    updateProduct,
    fetchProductsByShop,
    searchProducts,
    fetchProductsByCategory,
} from '@/stores/slices/product.slice';
import {
    selectAllProducts,
    selectSelectedProduct,
    selectProductIsLoading,
    selectProductError,
} from '@/stores/selectors/product.selector';

export const useProduct = () => {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectAllProducts);
    const selectedProduct = useAppSelector(selectSelectedProduct);
    const isLoading = useAppSelector(selectProductIsLoading);
    const error = useAppSelector(selectProductError);

    const handleFetchById = useCallback((id: string) => dispatch(fetchProductById(id)), [dispatch]);
    const handleUpdate = useCallback((id: string, data: any) => dispatch(updateProduct({ id, data })), [dispatch]);
    const handleFetchByShop = useCallback((shopId: string, pageable?: IPageable) => dispatch(fetchProductsByShop({ shopId, pageable })), [dispatch]);
    const handleSearch = useCallback((keyword: string, pageable?: IPageable) => dispatch(searchProducts({ keyword, pageable })), [dispatch]);
    const handleFetchByCategory = useCallback((categoryId: string, pageable?: IPageable) => dispatch(fetchProductsByCategory({ categoryId, pageable })), [dispatch]);

    return {
        products,
        selectedProduct,
        isLoading,
        error,
        fetchProductById: handleFetchById,
        updateProduct: handleUpdate,
        fetchProductsByShop: handleFetchByShop,
        searchProducts: handleSearch,
        fetchProductsByCategory: handleFetchByCategory,
    };
};

