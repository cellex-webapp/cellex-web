import { createAsyncThunk } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectShop = (state: RootState) => state.shop;

export const selectMyShop = createAsyncThunk(
    'shop/selectMyShop',
    async (_, { getState }) => {
        const state = getState() as RootState;
        return selectShop(state).shop;
    }
);

export const selectAllShops = createAsyncThunk(
    'shop/selectAllShops',
    async (_, { getState }) => {
        const state = getState() as RootState;
        return selectShop(state).allShops;
    }
);

export const selectPendingShops = createAsyncThunk(
    'shop/selectPendingShops',
    async (_, { getState }) => {
        const state = getState() as RootState;
        return selectShop(state).pendingShops;
    }
);

export const selectShopIsLoading = createAsyncThunk(
    'shop/selectShopIsLoading',
    async (_, { getState }) => {
        const state = getState() as RootState;
        return selectShop(state).isLoading;
    }
);

export const selectShopError = createAsyncThunk(
    'shop/selectShopError',
    async (_, { getState }) => {
        const state = getState() as RootState;
        return selectShop(state).error;
    }
);

