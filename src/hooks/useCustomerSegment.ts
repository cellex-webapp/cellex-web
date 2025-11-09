import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchAllSegments,
  fetchSegmentById,
  createSegment,
  updateSegment,
  deleteSegment,
  clearSelectedSegment,
} from '@/stores/slices/segment.slice';
import {
  selectAllSegments,
  selectSelectedSegment,
  selectCustomerSegmentIsLoading,
  selectCustomerSegmentError,
} from '@/stores/selectors/segment.selector';

export const useCustomerSegment = () => {
  const dispatch = useAppDispatch();

  const segments = useAppSelector(selectAllSegments);
  const selectedSegment = useAppSelector(selectSelectedSegment);
  const isLoading = useAppSelector(selectCustomerSegmentIsLoading);
  const error = useAppSelector(selectCustomerSegmentError);

  const handleFetchAll = useCallback(() => dispatch(fetchAllSegments()), [dispatch]);
  const handleFetchById = useCallback((id: string) => dispatch(fetchSegmentById(id)), [dispatch]);
  const handleCreate = useCallback((payload: CreateCustomerSegmentRequest) => dispatch(createSegment(payload)), [dispatch]);
  const handleUpdate = useCallback((id: string, payload: UpdateCustomerSegmentRequest) => dispatch(updateSegment({ id, payload })), [dispatch]);
  const handleDelete = useCallback((id: string) => dispatch(deleteSegment(id)), [dispatch]);
  const handleClearSelected = useCallback(() => dispatch(clearSelectedSegment()), [dispatch]);

  return {
    segments,
    selectedSegment,
    isLoading,
    error,
    fetchAllSegments: handleFetchAll,
    fetchSegmentById: handleFetchById,
    createSegment: handleCreate,
    updateSegment: handleUpdate,
    deleteSegment: handleDelete,
    clearSelectedSegment: handleClearSelected,
  };
};