import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import { fetchActiveSessions, fetchViewerToken, clearCurrentSession } from '@/stores/slices/livestream.slice';
import {
  selectActiveSessions,
  selectLivestreamIsLoading,
  selectLivestreamError,
  selectViewerToken
} from '@/stores/selectors/livestream.selector';

export const useLivestream = () => {
  const dispatch = useAppDispatch();

  const activeSessions = useAppSelector(selectActiveSessions);
  const isLoading = useAppSelector(selectLivestreamIsLoading);
  const error = useAppSelector(selectLivestreamError);
  const viewerToken = useAppSelector(selectViewerToken);

  const handleFetchActiveSessions = useCallback(() => {
    dispatch(fetchActiveSessions());
  }, [dispatch]);

  const handleFetchViewerToken = useCallback((sessionId: string) => {
    // Dùng unwrap để component có thể dùng try...catch bắt kết quả trực tiếp
    return dispatch(fetchViewerToken(sessionId)).unwrap();
  }, [dispatch]);

  const handleClearSession = useCallback(() => {
    dispatch(clearCurrentSession());
  }, [dispatch]);

  return {
    activeSessions,
    isLoading,
    error,
    viewerToken,
    fetchActiveSessions: handleFetchActiveSessions,
    fetchViewerToken: handleFetchViewerToken,
    clearSession: handleClearSession,
  };
};