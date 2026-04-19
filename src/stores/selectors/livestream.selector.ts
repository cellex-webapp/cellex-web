import { type RootState } from '../store';

export const selectActiveSessions = (state: RootState) => state.livestream.activeSessions;
export const selectLivestreamIsLoading = (state: RootState) => state.livestream.isLoading;
export const selectLivestreamError = (state: RootState) => state.livestream.error;
export const selectViewerToken = (state: RootState) => state.livestream.viewerToken;
export const selectSessionProducts = (state: RootState) => state.livestream.sessionProducts;