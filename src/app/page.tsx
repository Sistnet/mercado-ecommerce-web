'use client';

/**
 * Root Page - Redireciona para o tenant apropriado
 * AIDEV-NOTE: O projeto funciona baseado em tenants, a rota raiz redireciona para /{tenant}/
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // AIDEV-NOTE: Busca o tenant do localStorage (salvo pelo TenantProvider)
    const savedTenant = localStorage.getItem('current_tenant');

    if (savedTenant) {
      // Redireciona para a home do tenant
      router.replace(`/${savedTenant}`);
    } else {
      // AIDEV-NOTE: Em produção, o tenant seria detectado pelo subdomínio
      // Em desenvolvimento, usa um tenant padrão ou mostra erro
      const defaultTenant = 'lojinhateste';
      router.replace(`/${defaultTenant}`);
    }
  }, [router]);

  // Tela de loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
