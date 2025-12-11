/**
 * Auth Slice - Baseado em Flutter AuthProvider
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, STORAGE_KEYS } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  AuthState,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SocialLoginRequest,
  UserInfo,
} from '@/types/auth.types';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  temporaryToken: null,
  error: null,
  guestId: null,
};

// Async Thunks

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        email_or_phone: credentials.emailOrPhone,
        password: credentials.password,
        guest_id: credentials.guestId,
      });

      const data = response.data;

      // Salvar token no localStorage
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      }

      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Login failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, {
        f_name: data.fName,
        l_name: data.lName,
        phone: data.phone,
        email: data.email,
        password: data.password,
        referral_code: data.referralCode,
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Registration failed'
      );
    }
  }
);

export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async (data: SocialLoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.SOCIAL_LOGIN, {
        email: data.email,
        token: data.token,
        unique_id: data.uniqueId,
        medium: data.medium,
      });

      const result = response.data;

      if (result.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
      }

      return result;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Social login failed'
      );
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await api.post<{ user: UserInfo }>(API_ENDPOINTS.VERIFY_TOKEN);
      return { token, user: response.data.user };
    } catch (error: unknown) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Token verification failed'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  return null;
});

export const initializeGuest = createAsyncThunk(
  'auth/initializeGuest',
  async (_, { rejectWithValue }) => {
    try {
      // Verificar se já existe guest ID
      let guestId = localStorage.getItem(STORAGE_KEYS.GUEST_ID);

      if (!guestId) {
        const response = await api.post<{ guest_id: string }>(API_ENDPOINTS.GUEST_ADD);
        guestId = response.data.guest_id;
        localStorage.setItem(STORAGE_KEYS.GUEST_ID, guestId);
      }

      return guestId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { errors?: Array<{ message: string }> } } };
      return rejectWithValue(
        err.response?.data?.errors?.[0]?.message || 'Failed to initialize guest'
      );
    }
  }
);

// Slice

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTemporaryToken: (state, action: PayloadAction<string>) => {
      state.temporaryToken = action.payload;
    },
    clearTemporaryToken: (state) => {
      state.temporaryToken = null;
    },
    updateUser: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = !!action.payload.token;
        state.token = action.payload.token || null;
        state.temporaryToken = action.payload.temporaryToken || null;
        state.user = action.payload.user || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Social Login
      .addCase(socialLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = !!action.payload.token;
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
        state.error = null;
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.temporaryToken = null;
        state.error = null;
      })

      // Initialize Guest
      .addCase(initializeGuest.fulfilled, (state, action) => {
        state.guestId = action.payload;
      });
  },
});

export const { clearError, setTemporaryToken, clearTemporaryToken, updateUser } =
  authSlice.actions;

export default authSlice.reducer;
