import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/stores/slices/category.slice';
import {
  selectAllCategories,
  selectCategoryIsLoading,
  selectCategoryError,
  selectCategoryTree,
} from '@/stores/selectors/category.selector';

export const useCategory = () => {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectAllCategories);
  const categoryTree = useAppSelector(selectCategoryTree);
  const isLoading = useAppSelector(selectCategoryIsLoading);
  const error = useAppSelector(selectCategoryError);

  const handleFetchAll = useCallback(() => {
    return dispatch(fetchAllCategories());
  }, [dispatch]);

  const handleCreate = useCallback((payload: ICreateCategoryPayload) => {
    return dispatch(createCategory(payload));
  }, [dispatch]);

  const handleUpdate = useCallback((payload: IUpdateCategoryPayload) => {
    return dispatch(updateCategory(payload));
  }, [dispatch]);

  const handleDelete = useCallback((id: string) => {
    return dispatch(deleteCategory(id));
  }, [dispatch]);

  return {
    categories,
    categoryTree,
    isLoading,
    error,
    fetchAllCategories: handleFetchAll,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
  };
};