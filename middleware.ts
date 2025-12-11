/**
 * Next.js Middleware para resolução de tenant
 * Baseado em Flutter main_web.dart
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RESERVED_SUBDOMAINS = ['www', 'admin', 'api', 'app', 'mercado', 'hml', 'dev'];
const RESERVED_ROUTES = [
  '_next',
  'api',
  'favicon.ico',
  'images',
  'fonts',
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

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Ignorar arquivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // arquivos com extensão
  ) {
    return NextResponse.next();
  }

  let tenant: string | null = null;

  // 1. Extrair tenant do subdomínio (produção)
  const hostWithoutPort = host.split(':')[0];
  const parts = hostWithoutPort.split('.');

  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();
    if (!RESERVED_SUBDOMAINS.includes(subdomain) && /^[a-zA-Z0-9_-]{3,50}$/.test(subdomain)) {
      tenant = subdomain;
    }
  }

  // 2. Para localhost, extrair do path (desenvolvimento)
  if (!tenant && (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1')) {
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const firstPart = pathParts[0].toLowerCase();
      if (!RESERVED_ROUTES.includes(firstPart) && /^[a-zA-Z0-9_-]{3,50}$/.test(firstPart)) {
        tenant = firstPart;
      }
    }
  }

  // Criar response com header do tenant
  const response = NextResponse.next();

  if (tenant) {
    response.headers.set('x-tenant', tenant);
    response.headers.set('x-tenant-schema', tenant);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
