import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchAttributesOfCategory, fetchHighlightAttributesOfCategory, createAttributeOfCategory, updateAttributeOfCategory, deleteAttributeOfCategory } from '@/stores/slices/attribute.slice';
import { selectAttributes, selectHighlightAttributes, selectAttributeLoading, selectAttributeError } from '@/stores/selectors/attribute.selector';

export const useAttribute = () => {
  const dispatch = useAppDispatch();
  const attributes = useAppSelector(selectAttributes);
  const highlightAttributes = useAppSelector(selectHighlightAttributes);
  const isLoading = useAppSelector(selectAttributeLoading);
  const error = useAppSelector(selectAttributeError);

  const handleFetchAttributesOfCategory = useCallback(
    (categoryId: string) => dispatch(fetchAttributesOfCategory(categoryId)),
    [dispatch]
  );

  const handleFetchHighlightAttributesOfCategory = useCallback(
    (categoryId: string) => dispatch(fetchHighlightAttributesOfCategory(categoryId)),
    [dispatch]
  );

  const handleCreateAttributeOfCategory = useCallback(
    (categoryId: string, payload: ICreateUpdateAttributePayload) => 
      dispatch(createAttributeOfCategory({ categoryId, payload })),
    [dispatch]
  );

  const handleUpdateAttributeOfCategory = useCallback(
    (categoryId: string, payload: ICreateUpdateAttributePayload & { id: string }) => 
      dispatch(updateAttributeOfCategory({ categoryId, payload })),
    [dispatch]
  );

  const handleDeleteAttributeOfCategory = useCallback(
    (categoryId: string, attributeId: string) => 
      dispatch(deleteAttributeOfCategory({ categoryId, attributeId })),
    [dispatch]
  );

  return {
    attributes,
    highlightAttributes,
    isLoading,
    error,
    fetchAttributesOfCategory: handleFetchAttributesOfCategory,
    fetchHighlightAttributesOfCategory: handleFetchHighlightAttributesOfCategory,
    createAttributeOfCategory: handleCreateAttributeOfCategory,
    updateAttributeOfCategory: handleUpdateAttributeOfCategory,
    deleteAttributeOfCategory: handleDeleteAttributeOfCategory,
  };
};

export default useAttribute;
