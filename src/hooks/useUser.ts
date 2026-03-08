import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  addUserAccount,
  fetchAllUsers,
  fetchUserById,
  banUser,
  unbanUser,
  updateUserProfile,
  fetchMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress
} from '@/stores/slices/user.slice';
import {
  selectAllUsers,
  selectSelectedUser,
  selectUserIsLoading,
  selectUserError,
  selectUserPagination,
  selectMyAddresses
} from '@/stores/selectors/user.selector';

export const useUser = () => {
  const dispatch = useAppDispatch();

  const users = useAppSelector(selectAllUsers);
  const selectedUser = useAppSelector(selectSelectedUser);
  const pagination = useAppSelector(selectUserPagination);
  const isLoading = useAppSelector(selectUserIsLoading);
  const error = useAppSelector(selectUserError);
  const myAddresses = useAppSelector(selectMyAddresses);

  const handleAddUser = useCallback((payload: IAddAccountPayload) => {
    return dispatch(addUserAccount(payload));
  }, [dispatch]);

  const handleFetchAllUsers = useCallback((params?: IPaginationParams) => {
    return dispatch(fetchAllUsers(params));
  }, [dispatch]);

  const handleFetchUserById = useCallback((userId: string) => {
    return dispatch(fetchUserById(userId));
  }, [dispatch]);

  const handleBanUser = useCallback((payload: { userId: string; banReason?: string }) => {
    return dispatch(banUser(payload));
  }, [dispatch]);

  const handleUnbanUser = useCallback((userId: string) => {
    return dispatch(unbanUser(userId));
  }, [dispatch]);

  const handleUpdateProfile = useCallback((payload: IUpdateProfilePayload) => {
    return dispatch(updateUserProfile(payload));
  }, [dispatch]);

  const handleFetchMyAddresses = useCallback(() => {
    return dispatch(fetchMyAddresses());
  }, [dispatch]);

  const handleCreateMyAddress = useCallback((payload: ICreateUserAddressPayload) => {
    return dispatch(createMyAddress(payload)).unwrap(); // Dùng unwrap để bắt lỗi ở Component
  }, [dispatch]);

  const handleUpdateMyAddress = useCallback((id: string, payload: IUpdateUserAddressPayload) => {
    return dispatch(updateMyAddress({ id, payload })).unwrap();
  }, [dispatch]);

  const handleDeleteMyAddress = useCallback((id: string) => {
    return dispatch(deleteMyAddress(id)).unwrap();
  }, [dispatch]);

  return {
    users,
    selectedUser,
    pagination,
    isLoading,
    error,
    addUserAccount: handleAddUser,
    fetchAllUsers: handleFetchAllUsers,
    fetchUserById: handleFetchUserById,
    banUser: handleBanUser,
    unbanUser: handleUnbanUser,
    updateUserProfile: handleUpdateProfile,
    myAddresses,
    fetchMyAddresses: handleFetchMyAddresses,
    createMyAddress: handleCreateMyAddress,
    updateMyAddress: handleUpdateMyAddress,
    deleteMyAddress: handleDeleteMyAddress,
  };
};