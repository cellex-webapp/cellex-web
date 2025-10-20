import type { RootState } from '@/stores/store';

export const selectAttributes = (state: RootState) => (state as any).attribute?.attributes ?? [];
export const selectHighlightAttributes = (state: RootState) => (state as any).attribute?.highlightAttributes ?? [];
export const selectAttributeLoading = (state: RootState) => (state as any).attribute?.isLoading ?? false;
export const selectAttributeError = (state: RootState) => (state as any).attribute?.error ?? null;

export default {
  selectAttributes,
  selectHighlightAttributes,
  selectAttributeLoading,
  selectAttributeError,
};
