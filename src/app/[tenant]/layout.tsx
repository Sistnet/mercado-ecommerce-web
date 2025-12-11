'use client';

/**
 * Tenant Layout - Layout para rotas com tenant dinâmico
 * Usa TenantProvider para definir o tenant no Redux/localStorage
 */

import { TenantProvider } from '@/components/providers/tenant-provider';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantProvider>{children}</TenantProvider>;
}
