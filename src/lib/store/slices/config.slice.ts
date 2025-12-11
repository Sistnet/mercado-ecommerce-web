/**
 * Config Slice - Baseado em Flutter SplashProvider
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AppConfig, ConfigState, DeliveryInfo } from '@/types/config.types';

const initialState: ConfigState = {
  config: null,
  deliveryInfo: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AppConfig>(API_ENDPOINTS.CONFIG);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to load configuration'
      );
    }
  }
);

export const fetchDeliveryInfo = createAsyncThunk(
  'config/fetchDeliveryInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<DeliveryInfo>(API_ENDPOINTS.DELIVERY_INFO);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to load delivery info'
      );
    }
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    clearConfigError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config = action.payload;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDeliveryInfo.fulfilled, (state, action) => {
        state.deliveryInfo = action.payload;
      });
  },
});

export const { clearConfigError } = configSlice.actions;
export default configSlice.reducer;
