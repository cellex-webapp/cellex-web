import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchAttributesOfCategory,
  fetchHighlightAttributesOfCategory,
  createAttributeOfCategory,
  updateAttributeOfCategory,
  deleteAttributeOfCategory,
} from '@/stores/slices/attribute.slice';
import {
  selectAttributes,
  selectHighlightAttributes,
  selectAttributePagination,
  selectAttributeIsLoading,
  selectAttributeError,
} from '@/stores/selectors/attribute.selector';

export const useAttribute = () => {
  const dispatch = useAppDispatch();

  const attributes = useAppSelector(selectAttributes);
  const highlightAttributes = useAppSelector(selectHighlightAttributes);
  const pagination = useAppSelector(selectAttributePagination);
  const isLoading = useAppSelector(selectAttributeIsLoading);
  const error = useAppSelector(selectAttributeError);

  const getAttributes = useCallback((categoryId: string, params?: IPaginationParams) => {
    return dispatch(fetchAttributesOfCategory({ categoryId, params }));
  }, [dispatch]);

  const getHighlightAttributes = useCallback((categoryId: string) => {
    return dispatch(fetchHighlightAttributesOfCategory(categoryId));
  }, [dispatch]);

  const createAttribute = useCallback((categoryId: string, payload: ICreateUpdateAttributePayload) => {
    return dispatch(createAttributeOfCategory({ categoryId, payload }));
  }, [dispatch]);

  const updateAttribute = useCallback((categoryId: string, payload: ICreateUpdateAttributePayload & { id: string }) => {
    return dispatch(updateAttributeOfCategory({ categoryId, payload }));
  }, [dispatch]);

  const deleteAttribute = useCallback((categoryId: string, attributeId: string) => {
    return dispatch(deleteAttributeOfCategory({ categoryId, attributeId }));
  }, [dispatch]);

  return {
    attributes,
    highlightAttributes,
    pagination,
    isLoading,
    error,
    getAttributes,
    getHighlightAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  };
};