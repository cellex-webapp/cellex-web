import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchAllSegmentCoupons,
  fetchSegmentCouponById,
  fetchSegmentCouponsBySegmentId,
  createSegmentCoupon,
  updateSegmentCoupon,
  deleteSegmentCoupon,
  clearSegmentCouponState,
} from '@/stores/slices/segmentCoupon.slice';

export const useSegmentCoupon = () => {
  const dispatch = useAppDispatch();

  const items = useAppSelector((s) => s.segmentCoupon.items);
  const selected = useAppSelector((s) => s.segmentCoupon.selected);
  const isLoading = useAppSelector((s) => s.segmentCoupon.isLoading);
  const error = useAppSelector((s) => s.segmentCoupon.error);

  const handleFetchAll = useCallback(() => dispatch(fetchAllSegmentCoupons()), [dispatch]);
  const handleFetchById = useCallback((id: string) => dispatch(fetchSegmentCouponById(id)), [dispatch]);
  const handleFetchBySegmentId = useCallback(
    (segmentId: string) => dispatch(fetchSegmentCouponsBySegmentId(segmentId)),
    [dispatch]
  );
  const handleCreate = useCallback((payload: CreateSegmentCouponRequest) => dispatch(createSegmentCoupon(payload)), [dispatch]);
  const handleUpdate = useCallback(
    (id: string, payload: UpdateSegmentCouponRequest) => dispatch(updateSegmentCoupon({ id, payload })),
    [dispatch]
  );
  const handleDelete = useCallback((id: string) => dispatch(deleteSegmentCoupon(id)), [dispatch]);
  const handleClear = useCallback(() => dispatch(clearSegmentCouponState()), [dispatch]);

  return {
    items,
    selected,
    isLoading,
    error,
    fetchAll: handleFetchAll,
    fetchById: handleFetchById,
    fetchBySegmentId: handleFetchBySegmentId,
    create: handleCreate,
    update: handleUpdate,
    remove: handleDelete,
    clear: handleClear,
  };
};

export default useSegmentCoupon;
