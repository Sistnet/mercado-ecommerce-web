/**
 * Wallet Slice - Baseado em Flutter WalletAndLoyaltyProvider
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { WalletState, WalletTransaction, LoyaltyTransaction, WalletBonus } from '@/types/user.types';

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  loyaltyPoints: 0,
  loyaltyTransactions: [],
  bonuses: [],
  totalSize: 0,
  offset: 0,
  isLoading: false,
  error: null,
  filterType: 'all',
};

export const fetchWalletTransactions = createAsyncThunk(
  'wallet/fetchWalletTransactions',
  async (params: { offset?: number; limit?: number; type?: string } = {}, { rejectWithValue }) => {
    try {
      const { offset = 0, limit = 10, type = 'all' } = params;
      const url = `${API_ENDPOINTS.WALLET_TRANSACTIONS}?offset=${offset}&limit=${limit}${type !== 'all' ? `&transaction_type=${type}` : ''}`;
      const response = await api.get<{ total_size: number; data: WalletTransaction[] }>(url);
      return { transactions: response.data.data, totalSize: response.data.total_size, offset };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch wallet transactions');
    }
  }
);

export const fetchLoyaltyTransactions = createAsyncThunk(
  'wallet/fetchLoyaltyTransactions',
  async (params: { offset?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { offset = 0, limit = 10 } = params;
      const response = await api.get<{ data: LoyaltyTransaction[] }>(
        `${API_ENDPOINTS.LOYALTY_TRANSACTIONS}?offset=${offset}&limit=${limit}`
      );
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch loyalty transactions');
    }
  }
);

export const transferPointsToWallet = createAsyncThunk(
  'wallet/transferPointsToWallet',
  async (points: number, { rejectWithValue }) => {
    try {
      const response = await api.post<{ message: string; wallet_balance: number }>(
        API_ENDPOINTS.LOYALTY_TRANSFER,
        { point: points }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to transfer points');
    }
  }
);

export const fetchWalletBonuses = createAsyncThunk(
  'wallet/fetchWalletBonuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<WalletBonus[]>(API_ENDPOINTS.WALLET_BONUS_LIST);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch bonuses');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setFilterType: (state, action: PayloadAction<string>) => {
      state.filterType = action.payload;
    },
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    setLoyaltyPoints: (state, action: PayloadAction<number>) => {
      state.loyaltyPoints = action.payload;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletTransactions.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        const { transactions, totalSize, offset } = action.payload;
        state.transactions = offset === 0 ? transactions : [...state.transactions, ...transactions];
        state.totalSize = totalSize;
        state.offset = offset + transactions.length;
        if (transactions.length > 0) state.balance = transactions[0].balance;
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLoyaltyTransactions.fulfilled, (state, action) => {
        state.loyaltyTransactions = action.payload;
        if (action.payload.length > 0) state.loyaltyPoints = action.payload[0].balance;
      })
      .addCase(transferPointsToWallet.fulfilled, (state, action) => {
        state.balance = action.payload.wallet_balance;
      })
      .addCase(fetchWalletBonuses.fulfilled, (state, action) => {
        state.bonuses = action.payload;
      });
  },
});

export const { setFilterType, setBalance, setLoyaltyPoints, clearError } = walletSlice.actions;
export default walletSlice.reducer;
