'use client';

/**
 * Tenant Provider - Define o tenant no Redux/localStorage
 * Deve ser usado no layout de rotas com [tenant]
 */

import { useEffect, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setTenant } from '@/lib/store/slices/tenant.slice';

interface TenantProviderProps {
  children: React.ReactNode;
}

// Usar useLayoutEffect no cliente para executar antes do render
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function TenantProvider({ children }: TenantProviderProps) {
  const params = useParams();
  const tenant = params.tenant as string;
  const dispatch = useAppDispatch();
  const { currentTenant, isResolved } = useAppSelector((state) => state.tenant);

  // Definir o tenant imediatamente, de forma síncrona
  useIsomorphicLayoutEffect(() => {
    if (tenant && tenant !== currentTenant) {
      dispatch(setTenant(tenant));
    }
    // AIDEV-NOTE: localStorage must be set inside useEffect to avoid hydration mismatch
    if (tenant) {
      const storedTenant = localStorage.getItem('current_tenant');
      if (storedTenant !== tenant) {
        localStorage.setItem('current_tenant', tenant);
      }
    }
  }, [dispatch, tenant, currentTenant]);

  return <>{children}</>;
}
