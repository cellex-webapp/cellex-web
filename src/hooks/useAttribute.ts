import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchAttributesOfCategory, fetchHighlightAttributesOfCategory, createAttributeOfCategory, updateAttributeOfCategory, deleteAttributeOfCategory } from '@/stores/slices/attribute.slice';
import { selectAttributes, selectHighlightAttributes, selectAttributeLoading, selectAttributeError } from '@/stores/selectors/attribute.selector';

export const useAttribute = () => {
  const dispatch = useAppDispatch();
  const attributes = useAppSelector(selectAttributes);
  const highlightAttributes = useAppSelector(selectHighlightAttributes);
  const isLoading = useAppSelector(selectAttributeLoading);
  const error = useAppSelector(selectAttributeError);

  return {
    attributes,
    highlightAttributes,
    isLoading,
    error,
    fetchAttributesOfCategory: (categoryId: string) => dispatch(fetchAttributesOfCategory(categoryId)),
    fetchHighlightAttributesOfCategory: (categoryId: string) => dispatch(fetchHighlightAttributesOfCategory(categoryId)),
    createAttributeOfCategory: (categoryId: string, payload: ICreateUpdateAttributePayload) => dispatch(createAttributeOfCategory({ categoryId, payload })),
    updateAttributeOfCategory: (categoryId: string, payload: ICreateUpdateAttributePayload & { id: string }) => dispatch(updateAttributeOfCategory({ categoryId, payload })),
    deleteAttributeOfCategory: (categoryId: string, attributeId: string) => dispatch(deleteAttributeOfCategory({ categoryId, attributeId })),
  };
};

export default useAttribute;
