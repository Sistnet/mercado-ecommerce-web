/**
 * Tenant Slice - Gerencia o tenant atual
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TenantState {
  currentTenant: string | null;
  isResolved: boolean;
}

const initialState: TenantState = {
  currentTenant: null,
  isResolved: false,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenant: (state, action: PayloadAction<string>) => {
      state.currentTenant = action.payload;
      state.isResolved = true;
      // Salvar no localStorage para o API client acessar
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_tenant', action.payload);
      }
    },
    clearTenant: (state) => {
      state.currentTenant = null;
      state.isResolved = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('current_tenant');
      }
    },
  },
});

export const { setTenant, clearTenant } = tenantSlice.actions;
export default tenantSlice.reducer;
