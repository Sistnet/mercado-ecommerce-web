/**
 * Tenant Resolver - Baseado em Flutter tenant_interceptor.dart e main_web.dart
 *
 * Resolve o tenant do subdomínio ou path da URL
 */

const RESERVED_SUBDOMAINS = ['www', 'admin', 'api', 'app', 'mercado', 'hml', 'dev'];
const RESERVED_ROUTES = [
  'login',
  'register',
  'products',
  'cart',
  'checkout',
  'orders',
  'profile',
  'wallet',
  'wishlist',
  'notifications',
  'chat',
  'terms',
  'privacy',
  'about',
  'categories',
  'search',
  'maintenance',
  'forgot-password',
  'verification',
];

export class TenantResolver {
  /**
   * Extrai o tenant do host ou path
   * - Produção: loja1.mercancy.com.br → "loja1"
   * - Dev: localhost:3000/loja1 → "loja1"
   */
  static resolveTenantFromHost(): string | null {
    if (typeof window === 'undefined') return null;

    const host = window.location.host;
    const pathname = window.location.pathname;

    // 1. Tentar extrair do subdomínio
    const tenant = this.extractFromSubdomain(host);
    if (tenant) return tenant;

    // 2. Em desenvolvimento (localhost), extrair do path
    if (this.isLocalhost(host)) {
      return this.extractFromPath(pathname);
    }

    return null;
  }

  /**
   * Extrai tenant do subdomínio
   * loja1.mercancy.com.br → "loja1"
   */
  private static extractFromSubdomain(host: string): string | null {
    const hostWithoutPort = host.split(':')[0];
    const parts = hostWithoutPort.split('.');

    // Precisa ter pelo menos 3 partes (subdomain.domain.tld)
    if (parts.length >= 3) {
      const subdomain = parts[0].toLowerCase();

      if (!RESERVED_SUBDOMAINS.includes(subdomain) && this.isValidSlug(subdomain)) {
        return subdomain;
      }
    }

    return null;
  }

  /**
   * Extrai tenant do path (para desenvolvimento)
   * /loja1/products → "loja1"
   */
  private static extractFromPath(pathname: string): string | null {
    const pathParts = pathname.split('/').filter(Boolean);

    if (pathParts.length > 0) {
      const firstPart = pathParts[0].toLowerCase();

      if (!RESERVED_ROUTES.includes(firstPart) && this.isValidSlug(firstPart)) {
        return firstPart;
      }
    }

    return null;
  }

  /**
   * Verifica se é localhost ou ambiente de desenvolvimento
   */
  private static isLocalhost(host: string): boolean {
    const hostWithoutPort = host.split(':')[0];
    return (
      hostWithoutPort === 'localhost' ||
      hostWithoutPort === '127.0.0.1' ||
      hostWithoutPort.startsWith('192.168.') ||
      hostWithoutPort.endsWith('.local')
    );
  }

  /**
   * Valida se o slug é válido (3-50 caracteres alfanuméricos, _ ou -)
   */
  private static isValidSlug(slug: string): boolean {
    return /^[a-zA-Z0-9_-]{3,50}$/.test(slug);
  }

  /**
   * Obtém a base path do tenant para roteamento
   */
  static getTenantBasePath(): string {
    if (typeof window === 'undefined') return '';

    const host = window.location.host;

    // Em localhost, incluir tenant no path
    if (this.isLocalhost(host)) {
      const tenant = this.extractFromPath(window.location.pathname);
      return tenant ? `/${tenant}` : '';
    }

    // Em produção com subdomínio, path é normal
    return '';
  }

  /**
   * Remove o prefixo do tenant do path
   */
  static removeTenantFromPath(pathname: string): string {
    const tenant = this.resolveTenantFromHost();

    if (tenant && pathname.startsWith(`/${tenant}`)) {
      return pathname.slice(tenant.length + 1) || '/';
    }

    return pathname;
  }
}

/**
 * Hook para obter o tenant atual
 */
export function useTenant(): string | null {
  if (typeof window === 'undefined') return null;
  return TenantResolver.resolveTenantFromHost();
}

/**
 * Constantes de configuração do tenant
 */
export const TENANT_HEADER_NAME = 'X-Tenant';
export const TENANT_SCHEMA_HEADER_NAME = 'X-Tenant-Schema';
export const DEFAULT_TENANT = 'public';
