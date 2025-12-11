/**
 * Search Slice - Baseado em Flutter SearchProvider
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Product, ProductModel, ProductFilterType } from '@/types/product.types';

interface SearchState {
  query: string;
  results: Product[];
  searchHistory: string[];
  totalSize: number;
  offset: number;
  isLoading: boolean;
  error: string | null;
  filterType: ProductFilterType;
  minPrice: number;
  maxPrice: number;
  priceRangeFilter: { min: number; max: number } | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  searchHistory: [],
  totalSize: 0,
  offset: 0,
  isLoading: false,
  error: null,
  filterType: 'latest',
  minPrice: 0,
  maxPrice: 0,
  priceRangeFilter: null,
};

export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (
    params: {
      query: string;
      offset?: number;
      limit?: number;
      sortBy?: ProductFilterType;
      priceLow?: number;
      priceHigh?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { query, offset = 0, limit = 10, sortBy = 'latest', priceLow, priceHigh } = params;

      let url = `${API_ENDPOINTS.PRODUCTS_SEARCH}?limit=${limit}&offset=${offset}&name=${encodeURIComponent(query)}&sort_by=${sortBy}`;
      if (priceLow !== undefined) url += `&price_low=${priceLow}`;
      if (priceHigh !== undefined) url += `&price_high=${priceHigh}`;

      const response = await api.get<ProductModel>(url);
      return { data: response.data, query, offset };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setFilterType: (state, action: PayloadAction<ProductFilterType>) => {
      state.filterType = action.payload;
    },
    setPriceRangeFilter: (state, action: PayloadAction<{ min: number; max: number } | null>) => {
      state.priceRangeFilter = action.payload;
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory = [query, ...state.searchHistory.slice(0, 9)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('search_history', JSON.stringify(state.searchHistory));
        }
      }
    },
    loadHistory: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('search_history');
        if (saved) state.searchHistory = JSON.parse(saved);
      }
    },
    clearHistory: (state) => {
      state.searchHistory = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('search_history');
      }
    },
    clearResults: (state) => {
      state.results = [];
      state.query = '';
      state.offset = 0;
      state.totalSize = 0;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, query, offset } = action.payload;
        state.query = query;
        state.results = offset === 0 ? (data.products || []) : [...state.results, ...(data.products || [])];
        state.totalSize = data.total_size ?? data.totalSize ?? 0;
        state.offset = offset + (data.products?.length || 0);
        state.minPrice = data.lowest_price ?? data.minPrice ?? 0;
        state.maxPrice = data.highest_price ?? data.maxPrice ?? 0;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setQuery,
  setFilterType,
  setPriceRangeFilter,
  addToHistory,
  loadHistory,
  clearHistory,
  clearResults,
  clearError,
} = searchSlice.actions;
export default searchSlice.reducer;
