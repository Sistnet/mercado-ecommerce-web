/**
 * Address Slice - Baseado em Flutter LocationProvider
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, STORAGE_KEYS } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Address, AddressState, AddAddressRequest, UpdateAddressRequest } from '@/types/address.types';

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  isLoading: false,
  error: null,
};

export const fetchAddresses = createAsyncThunk(
  'address/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Address[]>(API_ENDPOINTS.ADDRESS_LIST);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/addAddress',
  async (data: AddAddressRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<Address>(API_ENDPOINTS.ADDRESS_ADD, {
        address_type: data.addressType,
        contact_person_number: data.contactPersonNumber,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        contact_person_name: data.contactPersonName,
        floor: data.floor,
        house: data.house,
        road: data.road,
        is_default: data.isDefault ? 1 : 0,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async (data: UpdateAddressRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<Address>(`${API_ENDPOINTS.ADDRESS_UPDATE}/${data.id}`, {
        address_type: data.addressType,
        contact_person_number: data.contactPersonNumber,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        contact_person_name: data.contactPersonName,
        floor: data.floor,
        house: data.house,
        road: data.road,
        is_default: data.isDefault ? 1 : 0,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/deleteAddress',
  async (addressId: number, { rejectWithValue }) => {
    try {
      await api.post(`${API_ENDPOINTS.ADDRESS_DELETE}?address_id=${addressId}`);
      return addressId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to delete address');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    selectAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
      if (action.payload && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_ADDRESS, JSON.stringify(action.payload));
      }
    },
    loadSelectedAddress: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEYS.USER_ADDRESS);
        if (saved) state.selectedAddress = JSON.parse(saved);
      }
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(a => a.id === action.payload.id);
        if (index >= 0) state.addresses[index] = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(a => a.id !== action.payload);
      });
  },
});

export const { selectAddress, loadSelectedAddress, clearError } = addressSlice.actions;
export default addressSlice.reducer;
