/**
 * Notifications Slice - Baseado em Flutter NotificationProvider
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface Notification {
  id: number;
  title: string;
  description: string;
  image?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to fetch notifications');
    }
  }
);

export const updateFcmToken = createAsyncThunk(
  'notifications/updateFcmToken',
  async (token: string, { rejectWithValue }) => {
    try {
      await api.post(API_ENDPOINTS.FCM_TOKEN, { token, _method: 'put' });
      return token;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(err.response?.data?.errors?.[0]?.message || 'Failed to update FCM token');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { markAsRead, markAllAsRead, addNotification, clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
