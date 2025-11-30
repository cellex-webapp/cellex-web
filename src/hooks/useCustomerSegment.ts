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

  const fetchAll = useCallback(() => dispatch(fetchAllSegments()), [dispatch]);
  const fetchById = useCallback((id: string) => dispatch(fetchSegmentById(id)), [dispatch]);
  const create = useCallback((payload: CreateCustomerSegmentRequest) => dispatch(createSegment(payload)), [dispatch]);
  const update = useCallback((id: string, payload: UpdateCustomerSegmentRequest) => dispatch(updateSegment({ id, payload })), [dispatch]);
  const remove = useCallback((id: string) => dispatch(deleteSegment(id)), [dispatch]);
  const clearSelected = useCallback(() => dispatch(clearSelectedSegment()), [dispatch]);

  return {
    segments,
    selectedSegment,
    isLoading,
    error,
    fetchAllSegments: fetchAll,
    fetchSegmentById: fetchById,
    createSegment: create,
    updateSegment: update,
    deleteSegment: remove,
    clearSelectedSegment: clearSelected,
  };
};