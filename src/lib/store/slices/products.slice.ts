/**
 * Products Slice - Baseado em Flutter ProductProvider
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Product,
  ProductModel,
  ProductsState,
  ProductFilterType,
} from '@/types/product.types';

const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  dailyNeedsProducts: [],
  mostReviewedProducts: [],
  selectedProduct: null,
  totalSize: 0,
  offset: 0,
  isLoading: false,
  error: null,
  filterType: 'latest',
  minPrice: 0,
  maxPrice: 0,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    params: { offset?: number; limit?: number; sortBy?: ProductFilterType } = {},
    { rejectWithValue }
  ) => {
    try {
      const { offset = 0, limit = 10, sortBy = 'latest' } = params;
      const response = await api.get<ProductModel | { products?: Product[]; data?: Product[] }>(
        `${API_ENDPOINTS.PRODUCTS_ALL}?limit=${limit}&offset=${offset}&sort_by=${sortBy}`
      );

      // Normaliza a resposta da API
      let data: ProductModel;
      if ('products' in response.data && Array.isArray(response.data.products)) {
        data = response.data as ProductModel;
      } else if (Array.isArray(response.data)) {
        data = { products: response.data, totalSize: response.data.length, offset: 0, limit };
      } else {
        data = { products: [], totalSize: 0, offset: 0, limit };
      }

      console.log('[Products] Fetched:', data.products?.length || 0, 'products');
      return { data, offset };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      console.error('[Products] Error:', err);
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to fetch products'
      );
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (
    params: { offset?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { offset = 0, limit = 10 } = params;
      const response = await api.get<ProductModel>(
        `${API_ENDPOINTS.PRODUCTS_FEATURED}?limit=${limit}&offset=${offset}`
      );
      return response.data.products;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to fetch featured products'
      );
    }
  }
);

export const fetchDailyNeedsProducts = createAsyncThunk(
  'products/fetchDailyNeedsProducts',
  async (
    params: { offset?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { offset = 0, limit = 10 } = params;
      const response = await api.get<ProductModel>(
        `${API_ENDPOINTS.PRODUCTS_DAILY_NEEDS}?limit=${limit}&offset=${offset}`
      );
      return response.data.products;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to fetch daily needs products'
      );
    }
  }
);

export const fetchMostReviewedProducts = createAsyncThunk(
  'products/fetchMostReviewedProducts',
  async (
    params: { offset?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { offset = 0, limit = 10 } = params;
      const response = await api.get<ProductModel>(
        `${API_ENDPOINTS.PRODUCTS_MOST_REVIEWED}?limit=${limit}&offset=${offset}`
      );
      return response.data.products;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to fetch most reviewed products'
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<Product>(
        `${API_ENDPOINTS.PRODUCT_DETAILS}/${productId}`
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to fetch product details'
      );
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilterType: (state, action: PayloadAction<ProductFilterType>) => {
      state.filterType = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    resetProducts: (state) => {
      state.products = [];
      state.offset = 0;
      state.totalSize = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, offset } = action.payload;

        if (offset === 0) {
          state.products = data.products || [];
        } else {
          state.products = [...state.products, ...(data.products || [])];
        }

        // Suporta ambos os formatos: snake_case (API) e camelCase
        state.totalSize = data.total_size ?? data.totalSize ?? 0;
        state.offset = offset + (data.products?.length || 0);
        state.minPrice = data.lowest_price ?? data.minPrice ?? 0;
        state.maxPrice = data.highest_price ?? data.maxPrice ?? 0;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Featured Products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })

      // Daily Needs Products
      .addCase(fetchDailyNeedsProducts.fulfilled, (state, action) => {
        state.dailyNeedsProducts = action.payload;
      })

      // Most Reviewed Products
      .addCase(fetchMostReviewedProducts.fulfilled, (state, action) => {
        state.mostReviewedProducts = action.payload;
      })

      // Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilterType, clearSelectedProduct, resetProducts } =
  productsSlice.actions;

export default productsSlice.reducer;
