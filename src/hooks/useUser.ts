import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import { addUserAccount, fetchAllUsers, fetchUserById } from '@/stores/slices/user.slice';
import {
  selectAllUsers,
  selectSelectedUser,
  selectUserIsLoading,
  selectUserError,
} from '@/stores/selectors/user.selector';

export const useUser = () => {
  const dispatch = useAppDispatch();

  const users = useAppSelector(selectAllUsers);
  const selectedUser = useAppSelector(selectSelectedUser);
  const isLoading = useAppSelector(selectUserIsLoading);
  const error = useAppSelector(selectUserError);

  const handleAddUser = useCallback((payload: IAddAccountPayload) => {
    return dispatch(addUserAccount(payload));
  }, [dispatch]);

  const handleFetchAllUsers = useCallback(() => {
    return dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleFetchUserById = useCallback((userId: string) => {
    return dispatch(fetchUserById(userId));
  }, [dispatch]);

  return {
    users,
    selectedUser,
    isLoading,
    error,
    addUserAccount: handleAddUser,
    fetchAllUsers: handleFetchAllUsers,
    fetchUserById: handleFetchUserById,
  };
};