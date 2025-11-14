import { RootState } from '@/stores/store';

export const selectSegmentCoupons = (state: RootState) => state.segmentCoupon.items;
export const selectSelectedSegmentCoupon = (state: RootState) => state.segmentCoupon.selected;
export const selectSegmentCouponsBySegment = (segmentId: string) => (state: RootState) => state.segmentCoupon.bySegment[segmentId] || [];
export const selectSegmentCouponLoading = (state: RootState) => state.segmentCoupon.isLoading;
export const selectSegmentCouponError = (state: RootState) => state.segmentCoupon.error;
