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

  const fetchAll = useCallback(() => dispatch(fetchAllSegmentCoupons()), [dispatch]);
  const fetchById = useCallback((id: string) => dispatch(fetchSegmentCouponById(id)), [dispatch]);
  const fetchBySegmentId = useCallback((segmentId: string) => dispatch(fetchSegmentCouponsBySegmentId(segmentId)), [dispatch]);
  const create = useCallback((payload: CreateSegmentCouponRequest) => dispatch(createSegmentCoupon(payload)), [dispatch]);
  const update = useCallback((id: string, payload: UpdateSegmentCouponRequest) => dispatch(updateSegmentCoupon({ id, payload })), [dispatch]);
  const remove = useCallback((id: string) => dispatch(deleteSegmentCoupon(id)), [dispatch]);
  const clear = useCallback(() => dispatch(clearSegmentCouponState()), [dispatch]);

  return {
    items,
    selected,
    isLoading,
    error,
    fetchAll,
    fetchById,
    fetchBySegmentId,
    create,
    update,
    remove,
    clear,
  };
};

export default useSegmentCoupon;
