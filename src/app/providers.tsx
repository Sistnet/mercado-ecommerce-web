'use client';

/**
 * Client Providers - Redux, Theme, etc.
 *
 * NOTA: O fetchConfig foi removido daqui porque precisa ser chamado
 * APÓS o tenant ser resolvido (via TenantProvider nas rotas [tenant]).
 * Cada página que precisa do config deve fazer o fetch após o tenant estar definido.
 */

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/sonner';
import { makeStore, AppStore } from '@/lib/store';
import { initializeCart } from '@/lib/store/slices/cart.slice';
import { initializeTheme } from '@/lib/store/slices/theme.slice';
import { verifyToken, initializeGuest } from '@/lib/store/slices/auth.slice';
import { loadSelectedAddress } from '@/lib/store/slices/address.slice';
import { loadHistory } from '@/lib/store/slices/search.slice';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Usar useState com inicializador para criar store apenas uma vez
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    // Inicializar tema
    store.dispatch(initializeTheme());

    // Inicializar carrinho do localStorage
    store.dispatch(initializeCart());

    // Carregar endereço selecionado
    store.dispatch(loadSelectedAddress());

    // Carregar histórico de busca
    store.dispatch(loadHistory());

    // Verificar token de autenticação
    store.dispatch(verifyToken()).then((result) => {
      // Se não autenticado, inicializar como guest
      if (result.meta.requestStatus === 'rejected') {
        store.dispatch(initializeGuest());
      }
    });

    // NOTA: fetchConfig não é chamado aqui porque depende do tenant
    // O fetch é feito nas páginas após TenantProvider resolver o tenant
  }, [store]);

  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" richColors />
    </Provider>
  );
}
