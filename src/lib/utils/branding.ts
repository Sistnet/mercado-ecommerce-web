/**
 * Branding Utility - Applies white-label customization via CSS variables
 * AIDEV-NOTE: Converts hex colors to oklch and applies to :root
 */

import type { BrandingConfig } from '@/types/config.types';

/**
 * Convert hex color to oklch format for Tailwind CSS v4 compatibility
 * Uses a simplified conversion that works well for UI colors
 */
function hexToOklch(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  // Convert to linear RGB
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  // Convert to XYZ (D65)
  const x = 0.4124564 * rLin + 0.3575761 * gLin + 0.1804375 * bLin;
  const y = 0.2126729 * rLin + 0.7151522 * gLin + 0.0721750 * bLin;
  const z = 0.0193339 * rLin + 0.1191920 * gLin + 0.9503041 * bLin;

  // Convert to LMS
  const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
  const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

  // Convert to Oklab
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const L = 0.2104542553 * lRoot + 0.7936177850 * mRoot - 0.0040720468 * sRoot;
  const A = 1.9779984951 * lRoot - 2.4285922050 * mRoot + 0.4505937099 * sRoot;
  const B = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.8086757660 * sRoot;

  // Convert to Oklch
  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Format as oklch string (with reasonable precision)
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

/**
 * Calculate contrasting foreground color (white or black)
 * Based on relative luminance
 */
function getContrastColor(hex: string): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, dark for light colors
  return luminance > 0.5 ? 'oklch(0.205 0 0)' : 'oklch(0.985 0 0)';
}

/**
 * Apply branding configuration to document CSS variables
 * Only applies non-null values (null = use defaults from globals.css)
 */
export function applyBranding(branding: BrandingConfig | undefined): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Apply primary color
  if (branding?.primary_color) {
    const primaryOklch = hexToOklch(branding.primary_color);
    const primaryForeground = getContrastColor(branding.primary_color);

    root.style.setProperty('--primary', primaryOklch);
    root.style.setProperty('--primary-foreground', primaryForeground);

    // Also update sidebar primary for consistency
    root.style.setProperty('--sidebar-primary', primaryOklch);
    root.style.setProperty('--sidebar-primary-foreground', primaryForeground);
  }

  // Apply secondary color
  if (branding?.secondary_color) {
    const secondaryOklch = hexToOklch(branding.secondary_color);
    const secondaryForeground = getContrastColor(branding.secondary_color);

    root.style.setProperty('--secondary', secondaryOklch);
    root.style.setProperty('--secondary-foreground', secondaryForeground);

    // Also use for accent
    root.style.setProperty('--accent', secondaryOklch);
    root.style.setProperty('--accent-foreground', secondaryForeground);
  }

  // Apply background color
  if (branding?.background_color) {
    const backgroundOklch = hexToOklch(branding.background_color);
    const foregroundColor = getContrastColor(branding.background_color);

    root.style.setProperty('--background', backgroundOklch);
    root.style.setProperty('--foreground', foregroundColor);

    // Also update card and popover backgrounds for consistency
    root.style.setProperty('--card', backgroundOklch);
    root.style.setProperty('--card-foreground', foregroundColor);
    root.style.setProperty('--popover', backgroundOklch);
    root.style.setProperty('--popover-foreground', foregroundColor);
  }

  // AIDEV-NOTE: Apply card/thumbnail background color (used in product image containers)
  // Uses a custom variable --product-card-bg instead of --muted to avoid affecting menu text
  if (branding?.card_background_color) {
    const cardBgOklch = hexToOklch(branding.card_background_color);
    root.style.setProperty('--product-card-bg', cardBgOklch);
  }

  // Apply favicon
  if (branding?.favicon_url) {
    updateFavicon(branding.favicon_url);
  }

  // AIDEV-NOTE: Apply tenant name as page title
  if (branding?.tenant_name) {
    updatePageTitle(branding.tenant_name);
  }
}

/**
 * Update the page title dynamically with tenant name
 * AIDEV-NOTE: Sets document.title to use tenant name from admin settings
 */
function updatePageTitle(tenantName: string): void {
  document.title = tenantName;
}

/**
 * Update the page favicon dynamically
 * AIDEV-NOTE: Uses a specific ID to avoid conflicts with React DOM management
 * Instead of removing all favicons, we update/create one with a known ID
 */
function updateFavicon(faviconUrl: string): void {
  const FAVICON_ID = 'tenant-favicon';

  // Find or create favicon element with our specific ID
  let link = document.getElementById(FAVICON_ID) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.id = FAVICON_ID;
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  // Update properties
  link.type = faviconUrl.endsWith('.svg')
    ? 'image/svg+xml'
    : faviconUrl.endsWith('.png')
      ? 'image/png'
      : 'image/x-icon';
  link.href = faviconUrl;
}

/**
 * Reset branding to defaults (remove custom CSS variables)
 */
export function resetBranding(): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Remove custom properties (will fall back to globals.css defaults)
  root.style.removeProperty('--primary');
  root.style.removeProperty('--primary-foreground');
  root.style.removeProperty('--secondary');
  root.style.removeProperty('--secondary-foreground');
  root.style.removeProperty('--accent');
  root.style.removeProperty('--accent-foreground');
  root.style.removeProperty('--sidebar-primary');
  root.style.removeProperty('--sidebar-primary-foreground');
  root.style.removeProperty('--background');
  root.style.removeProperty('--foreground');
  root.style.removeProperty('--card');
  root.style.removeProperty('--card-foreground');
  root.style.removeProperty('--popover');
  root.style.removeProperty('--popover-foreground');
  root.style.removeProperty('--product-card-bg');
}

/**
 * Check if branding has any custom values
 */
export function hasCustomBranding(branding: BrandingConfig | undefined): boolean {
  if (!branding) return false;

  return !!(
    branding.primary_color ||
    branding.secondary_color ||
    branding.background_color ||
    branding.card_background_color ||
    branding.logo_url ||
    branding.favicon_url
  );
}
