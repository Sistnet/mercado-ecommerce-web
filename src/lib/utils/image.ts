/**
 * Image URL Helper - Constrói URLs de imagem para o tenant
 *
 * Usa a API Laravel como proxy para acessar imagens do Google Cloud Storage.
 * O backend faz a autenticação com GCS usando as credenciais do servidor.
 *
 * Formato: {API_URL}/{tenant}/storage/gcs/img/tenants/{tenant}/{type}/{filename}
 */

import type { BaseUrls } from '@/types/config.types';

export type ImageType =
  | 'product'
  | 'customer'
  | 'banner'
  | 'category'
  | 'review'
  | 'notification'
  | 'ecommerce'
  | 'delivery_man'
  | 'chat'
  | 'category_banner'
  | 'flash_sale'
  | 'gateway'
  | 'order';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

// URL base da API Laravel (proxy para GCS)
// AIDEV-NOTE: Inclui porta 80 explícita para compatibilidade com Next.js remotePatterns
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';

/**
 * Obtém o tenant atual do localStorage
 */
function getCurrentTenant(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('current_tenant');
  } catch {
    return null;
  }
}

/**
 * Constrói URL completa da imagem usando a API Laravel como proxy
 *
 * @param baseUrls - Objeto base_urls do config (mantido para compatibilidade)
 * @param type - Tipo de imagem (product, category, banner, etc.)
 * @param filename - Nome do arquivo da imagem
 * @returns URL completa ou placeholder
 *
 * @example
 * // Retorna: http://localhost/lojinhateste/storage/gcs/img/tenants/lojinhateste/category/image.png
 * getImageUrl(config.base_urls, 'category', 'image.png');
 */
export function getImageUrl(
  baseUrls: BaseUrls | undefined | null,
  type: ImageType,
  filename: string | undefined | null
): string {
  if (!filename) {
    return PLACEHOLDER_IMAGE;
  }

  const tenant = getCurrentTenant();

  if (!tenant) {
    return PLACEHOLDER_IMAGE;
  }

  // Remove leading slash do filename se existir
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;

  // Usa a API Laravel como proxy para GCS (o backend faz autenticação)
  return `${API_BASE_URL}/${tenant}/storage/gcs/img/tenants/${tenant}/${type}/${cleanFilename}`;
}

/**
 * Hook-friendly helper que retorna uma função getImageUrl pré-configurada
 */
export function createImageUrlGetter(baseUrls: BaseUrls | undefined | null) {
  return (type: ImageType, filename: string | undefined | null) =>
    getImageUrl(baseUrls, type, filename);
}
