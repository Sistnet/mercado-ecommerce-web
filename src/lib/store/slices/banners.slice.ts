/**
 * Banners Slice - Baseado em Flutter BannerProvider
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Banner, BannersState, FlashDeal, FlashDealsState } from '@/types/product.types';

const initialBannersState: BannersState = {
  banners: [],
  isLoading: false,
  error: null,
};

export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Banner[]>(API_ENDPOINTS.BANNERS);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch banners');
    }
  }
);

export const fetchFlashDeals = createAsyncThunk(
  'banners/fetchFlashDeals',
  async (params: { offset?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { offset = 0, limit = 10 } = params;
      const response = await api.get<{ flash_deal: FlashDeal; products: FlashDeal['products'] }>(
        `${API_ENDPOINTS.FLASH_DEALS}?limit=${limit}&offset=${offset}`
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch flash deals');
    }
  }
);

interface CombinedState extends BannersState {
  flashDeal: FlashDeal | null;
  flashDealProducts: FlashDeal['products'];
  flashDealsLoading: boolean;
}

const initialState: CombinedState = {
  ...initialBannersState,
  flashDeal: null,
  flashDealProducts: [],
  flashDealsLoading: false,
};

const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => { state.isLoading = true; })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFlashDeals.pending, (state) => { state.flashDealsLoading = true; })
      .addCase(fetchFlashDeals.fulfilled, (state, action) => {
        state.flashDealsLoading = false;
        state.flashDeal = action.payload.flash_deal;
        state.flashDealProducts = action.payload.products || [];
      })
      .addCase(fetchFlashDeals.rejected, (state) => { state.flashDealsLoading = false; });
  },
});

export const { clearError } = bannersSlice.actions;
export default bannersSlice.reducer;
