'use client';

/**
 * Products Listing Page - Lista todos os produtos com filtros
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ChevronRight, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchDailyNeedsProducts,
  setFilterType,
} from '@/lib/store/slices/products.slice';
import { fetchConfig } from '@/lib/store/slices/config.slice';
import { ProductCard } from '@/components/features/products/product-card';
import type { ProductFilterType } from '@/types/product.types';

type SortOption = 'latest' | 'price_low' | 'price_high' | 'name_asc' | 'name_desc';

export default function ProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenant = params.tenant as string;
  const filter = searchParams.get('filter'); // 'featured', 'daily-needs', etc.
  const dispatch = useAppDispatch();

  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { config, isLoading: configLoading, isInitialized: configInitialized } = useAppSelector(
    (state) => state.config
  );
  const {
    products = [],
    featuredProducts = [],
    dailyNeedsProducts = [],
    isLoading: productsLoading,
    totalSize,
  } = useAppSelector((state) => state.products) || {};
  const { currentTenant, isResolved } = useAppSelector((state) => state.tenant) || {};

  // Determinar qual lista de produtos mostrar baseado no filtro
  const getDisplayProducts = () => {
    switch (filter) {
      case 'featured':
        return featuredProducts;
      case 'daily-needs':
        return dailyNeedsProducts;
      default:
        return products;
    }
  };

  const displayProducts = getDisplayProducts();

  // Título da página baseado no filtro
  const getPageTitle = () => {
    switch (filter) {
      case 'featured':
        return 'Produtos em Destaque';
      case 'daily-needs':
        return 'Necessidades Diárias';
      default:
        return 'Todos os Produtos';
    }
  };

  // Carregar config quando tenant estiver resolvido
  useEffect(() => {
    if (tenant && isResolved && currentTenant === tenant && !configInitialized && !configLoading) {
      dispatch(fetchConfig());
    }
  }, [dispatch, tenant, isResolved, currentTenant, configInitialized, configLoading]);

  // Carregar produtos após config estar disponível
  useEffect(() => {
    if (tenant && isResolved && currentTenant === tenant && configInitialized && config?.base_urls) {
      switch (filter) {
        case 'featured':
          dispatch(fetchFeaturedProducts({ limit: 50 }));
          break;
        case 'daily-needs':
          dispatch(fetchDailyNeedsProducts({ limit: 50 }));
          break;
        default:
          dispatch(fetchProducts({ limit: 50 }));
      }
    }
  }, [dispatch, tenant, isResolved, currentTenant, configInitialized, config?.base_urls, filter]);

  // Ordenar produtos
  const sortedProducts = [...displayProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Loading state
  if (configLoading || !configInitialized || !config?.base_urls) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href={`/${tenant}`} className="hover:text-primary">
          Início
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{getPageTitle()}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground mt-1">
            {sortedProducts.length} produto{sortedProducts.length !== 1 ? 's' : ''} encontrado
            {sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Link href={`/${tenant}/products`}>
            <Button variant={!filter ? 'default' : 'outline'} size="sm">
              Todos
            </Button>
          </Link>
          <Link href={`/${tenant}/products?filter=featured`}>
            <Button variant={filter === 'featured' ? 'default' : 'outline'} size="sm">
              Destaques
            </Button>
          </Link>
          <Link href={`/${tenant}/products?filter=daily-needs`}>
            <Button variant={filter === 'daily-needs' ? 'default' : 'outline'} size="sm">
              Diários
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Mais Recentes</SelectItem>
              <SelectItem value="price_low">Menor Preço</SelectItem>
              <SelectItem value="price_high">Maior Preço</SelectItem>
              <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3'
              : 'flex flex-col gap-3'
          }
        >
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground mt-1">
            Tente ajustar os filtros ou volte mais tarde.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${tenant}/products`}>Ver todos os produtos</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
