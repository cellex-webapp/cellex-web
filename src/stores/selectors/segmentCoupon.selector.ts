import { RootState } from '@/stores/store';

export const selectSegmentCoupons = (state: RootState) => Array.isArray(state.segmentCoupon.items) ? state.segmentCoupon.items : [];
export const selectSelectedSegmentCoupon = (state: RootState) => state.segmentCoupon.selected;
export const selectSegmentCouponsBySegment = (segmentId: string) => (state: RootState) => {
	const arr = state.segmentCoupon.bySegment[segmentId];
	return Array.isArray(arr) ? arr : [];
};
export const selectSegmentCouponLoading = (state: RootState) => state.segmentCoupon.isLoading;
export const selectSegmentCouponError = (state: RootState) => state.segmentCoupon.error;
