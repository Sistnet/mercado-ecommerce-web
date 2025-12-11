/**
 * Profile Slice - Baseado em Flutter ProfileProvider
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ProfileState, UserProfile, UpdateProfileRequest } from '@/types/user.types';

const initialState: ProfileState = {
  user: null,
  isLoading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<UserProfile>(API_ENDPOINTS.CUSTOMER_INFO);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('f_name', data.fName);
      formData.append('l_name', data.lName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      if (data.password) formData.append('password', data.password);
      if (data.image) formData.append('image', data.image);

      const response = await api.post<UserProfile>(API_ENDPOINTS.CUSTOMER_UPDATE_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to update profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearProfile: (state) => { state.user = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
