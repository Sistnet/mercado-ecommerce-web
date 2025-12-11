/**
 * Orders Slice - Baseado em Flutter OrderProvider
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Order, OrderDetails, OrdersState, TimeSlot, PlaceOrderRequest, TrackingData } from '@/types/order.types';

const initialState: OrdersState = {
  orders: [],
  runningOrders: [],
  historyOrders: [],
  selectedOrder: null,
  orderDetails: [],
  timeSlots: [],
  trackingData: null,
  totalSize: 0,
  offset: 0,
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { offset?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { offset = 0, limit = 10 } = params;
      const response = await api.get<{ orders: Order[]; total_size: number }>(
        `${API_ENDPOINTS.ORDER_LIST}?limit=${limit}&offset=${offset}`
      );
      return { orders: response.data.orders, totalSize: response.data.total_size, offset };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await api.post<{ order: Order; details: OrderDetails[] }>(
        API_ENDPOINTS.ORDER_DETAILS,
        { order_id: orderId }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch order details');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData: PlaceOrderRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<{ order_id: number; message: string }>(
        API_ENDPOINTS.ORDER_PLACE,
        orderData
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to place order');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      await api.post(API_ENDPOINTS.ORDER_CANCEL, { order_id: orderId });
      return orderId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to cancel order');
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await api.post<TrackingData>(API_ENDPOINTS.ORDER_TRACK, { order_id: orderId });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to track order');
    }
  }
);

export const fetchTimeSlots = createAsyncThunk(
  'orders/fetchTimeSlots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<TimeSlot[]>(API_ENDPOINTS.TIME_SLOTS);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch time slots');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSelectedOrder: (state) => { state.selectedOrder = null; state.orderDetails = []; },
    clearTrackingData: (state) => { state.trackingData = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        const { orders, totalSize, offset } = action.payload;
        state.orders = offset === 0 ? orders : [...state.orders, ...orders];
        state.totalSize = totalSize;
        state.offset = offset + orders.length;
        // Separar pedidos em andamento e histórico
        state.runningOrders = state.orders.filter(o =>
          ['pending', 'confirmed', 'processing', 'out_for_delivery'].includes(o.orderStatus)
        );
        state.historyOrders = state.orders.filter(o =>
          ['delivered', 'returned', 'failed', 'canceled'].includes(o.orderStatus)
        );
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.selectedOrder = action.payload.order;
        state.orderDetails = action.payload.details;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const orderId = action.payload;
        const index = state.orders.findIndex(o => o.id === orderId);
        if (index >= 0) {
          state.orders[index].orderStatus = 'canceled';
        }
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.trackingData = action.payload;
      })
      .addCase(fetchTimeSlots.fulfilled, (state, action) => {
        state.timeSlots = action.payload;
      });
  },
});

export const { clearError, clearSelectedOrder, clearTrackingData } = ordersSlice.actions;
export default ordersSlice.reducer;
