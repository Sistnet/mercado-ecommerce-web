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
      const response = await api.get<Category[] | { data?: Category[] }>(`${API_ENDPOINTS.CATEGORY_CHILDREN}/${categoryId}`);

      // AIDEV-NOTE: A API pode retornar array diretamente ou objeto com data
      let subCategories: Category[];
      if (Array.isArray(response.data)) {
        subCategories = response.data;
      } else if (response.data && 'data' in response.data) {
        subCategories = response.data.data || [];
      } else {
        subCategories = [];
      }

      return subCategories;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch subcategories');
    }
  }
);

// Interface para resposta de produtos da categoria
interface CategoryProductsResponse {
  products?: Product[];
  data?: Product[];
  total_size?: number;
  limit?: number;
  offset?: number;
}

export const fetchCategoryProducts = createAsyncThunk(
  'categories/fetchCategoryProducts',
  async (params: { categoryId: number; offset?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const { categoryId, offset = 0, limit = 10 } = params;
      const response = await api.get<Product[] | CategoryProductsResponse>(
        `${API_ENDPOINTS.CATEGORY_PRODUCTS}/${categoryId}?limit=${limit}&offset=${offset}`
      );

      // AIDEV-NOTE: A API pode retornar array diretamente ou objeto com products/data
      let products: Product[];
      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data && 'products' in response.data) {
        products = response.data.products || [];
      } else if (response.data && 'data' in response.data) {
        products = response.data.data || [];
      } else {
        products = [];
      }

      console.log('[Categories] Fetched products for category:', categoryId, 'count:', products.length);
      return products;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      console.error('[Categories] Error fetching products:', err);
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
