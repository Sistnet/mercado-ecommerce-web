/**
 * Categories Slice - Baseado em Flutter CategoryProvider
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Category, CategoriesState, Product, ProductModel } from '@/types/product.types';

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  subCategories: [],
  categoryProducts: [],
  isLoading: false,
  error: null,
};

// Interface para possíveis formatos de resposta da API
interface CategoriesApiResponse {
  categories?: Category[];
  data?: Category[];
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Category[] | CategoriesApiResponse>(API_ENDPOINTS.CATEGORIES);

      // A API pode retornar diretamente um array ou um objeto com propriedade categories/data
      let categories: Category[];
      if (Array.isArray(response.data)) {
        categories = response.data;
      } else if (response.data && 'categories' in response.data) {
        categories = response.data.categories || [];
      } else if (response.data && 'data' in response.data) {
        categories = response.data.data || [];
      } else {
        categories = [];
      }

      console.log('[Categories] Fetched:', categories.length, 'categories');
      return categories;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      console.error('[Categories] Error:', err);
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchSubCategories = createAsyncThunk(
  'categories/fetchSubCategories',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const response = await api.get<Category[]>(`${API_ENDPOINTS.CATEGORY_CHILDREN}/${categoryId}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch subcategories');
    }
  }
);

export const fetchCategoryProducts = createAsyncThunk(
  'categories/fetchCategoryProducts',
  async (params: { categoryId: number; offset?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const { categoryId, offset = 0, limit = 10 } = params;
      const response = await api.get<ProductModel>(
        `${API_ENDPOINTS.CATEGORY_PRODUCTS}/${categoryId}?limit=${limit}&offset=${offset}`
      );
      return response.data.products;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch category products');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    selectCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearCategoryProducts: (state) => {
      state.categoryProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subCategories = action.payload;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.categoryProducts = action.payload;
      });
  },
});

export const { selectCategory, clearCategoryProducts } = categoriesSlice.actions;
export default categoriesSlice.reducer;
