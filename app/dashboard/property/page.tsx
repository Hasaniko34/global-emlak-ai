'use client';

// Force dynamic rendering to prevent prerender errors with useSession
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  HeartIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// Sayfa başına gösterilecek öğe sayısı
const ITEMS_PER_PAGE = 9;

interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  location: {
    address: string;
    city: string;
    district: string;
  };
  features: {
    size: number;
    rooms?: number;
    bathrooms?: number;
  };
  price: number;
  currency: string;
  status: string;
  financials: {
    currentValue: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  isFavorite: boolean;
  images: string[];
  createdAt: string;
}

// LoadingSpinner bileşenini React.memo ile sarmalayarak gereksiz render'ları önlüyoruz
const LoadingSpinner = React.memo(() => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>
  );
});
LoadingSpinner.displayName = 'LoadingSpinner';

// Pagination bileşeni
const Pagination = React.memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void 
}) => {
  // Sayfa numaralarını oluştur
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Toplam sayfa sayısı az ise tüm sayfaları göster
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Çok sayfa varsa, mevcut sayfanın etrafındakileri göster
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Başlangıç sayfasını ayarla
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // İlk sayfa
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Orta sayfalar
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Son sayfa
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      
      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={page === '...'}
          className={`px-3 py-1 rounded-md ${
            page === currentPage 
              ? 'bg-blue-600 text-white' 
              : 'border border-gray-300 hover:bg-gray-50'
          } ${page === '...' ? 'cursor-default' : ''}`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
});
Pagination.displayName = 'Pagination';

// PropertyCard bileşeni
const PropertyCard = React.memo(({ 
  property, 
  onToggleFavorite 
}: { 
  property: Property; 
  onToggleFavorite: (id: string) => void 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {property.images && property.images.length > 0 ? (
          <img 
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Resim Yok
          </div>
        )}
        <button 
          onClick={() => onToggleFavorite(property._id)}
          className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
        >
          {property.isFavorite ? (
            <HeartIconSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
          <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded ${
            property.status === 'active' ? 'bg-green-600' :
            property.status === 'sold' ? 'bg-red-600' :
            'bg-yellow-600'
          }`}>
            {property.status === 'active' ? 'Aktif' : 
             property.status === 'sold' ? 'Satılmış' : 'Kiralık'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <Link href={`/dashboard/property/${property._id}`}>
          <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600">{property.title}</h2>
        </Link>
        <p className="text-gray-600 text-sm mt-1 truncate">{property.location.district}, {property.location.city}</p>
        
        <div className="flex justify-between items-end mt-3">
          <div>
            <p className="text-lg font-bold text-gray-900">{property.price.toLocaleString('tr-TR')} {property.currency}</p>
            {property.financials.currentValue !== property.price && (
              <p className="text-sm text-green-600">
                Güncel: {property.financials.currentValue.toLocaleString('tr-TR')} TL
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {property.features.size} m²
            {property.features.rooms && `, ${property.features.rooms} oda`}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {new Date(property.createdAt).toLocaleDateString('tr-TR')}
          </span>
          <div className="space-x-2">
            <Link
              href={`/dashboard/property/${property._id}`}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Detaylar
            </Link>
            <Link
              href={`/dashboard/property/${property._id}/edit`}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Düzenle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
PropertyCard.displayName = 'PropertyCard';

// PropertySkeleton bileşeni
const PropertySkeleton = React.memo(() => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        <div className="flex justify-between items-end mt-3">
          <div>
            <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
});
PropertySkeleton.displayName = 'PropertySkeleton';

// LoadingSkeletons bileşeni
const LoadingSkeletons = React.memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, index) => (
        <PropertySkeleton key={index} />
      ))}
    </div>
  );
});
LoadingSkeletons.displayName = 'LoadingSkeletons';

function PropertyContent() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    propertyType: '',
    status: '',
    priceMin: '',
    priceMax: '',
    city: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Gayrimenkulleri yükle
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/property');
        if (!response.ok) {
          throw new Error('Gayrimenkuller yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setProperties(data.properties || []);
        setFilteredProperties(data.properties || []);
      } catch (err) {
        console.error('Gayrimenkul yükleme hatası:', err);
        setError('Gayrimenkuller yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchProperties();
    }
  }, [status]);
  
  // Arama ve filtreleme
  useEffect(() => {
    let result = [...properties];
    
    // Arama terimini uygula
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(property => 
        property.title.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.location.address.toLowerCase().includes(searchLower) ||
        property.location.city.toLowerCase().includes(searchLower) ||
        property.location.district.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtreleri uygula
    if (filters.propertyType) {
      result = result.filter(property => property.propertyType === filters.propertyType);
    }
    if (filters.status) {
      result = result.filter(property => property.status === filters.status);
    }
    if (filters.priceMin) {
      result = result.filter(property => property.price >= Number(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter(property => property.price <= Number(filters.priceMax));
    }
    if (filters.city) {
      result = result.filter(property => 
        property.location.city.toLowerCase() === filters.city.toLowerCase()
      );
    }
    
    // Sıralama
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'size':
          aValue = a.features.size;
          bValue = b.features.size;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number) 
          : (bValue as number) - (aValue as number);
      }
    });
    
    setFilteredProperties(result);
    // Filtreleme veya sıralama değiştiğinde ilk sayfaya dön
    setCurrentPage(1);
  }, [properties, searchTerm, sortBy, sortOrder, filters]);
  
  // Sıralama değiştirme
  const handleSortChange = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);
  
  // Favori değiştirme
  const handleToggleFavorite = useCallback(async (propertyId: string) => {
    try {
      const response = await fetch(`/api/property/${propertyId}/favorite`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Favori durumu güncellenirken bir hata oluştu');
      }
      
      // Başarılı güncelleme sonrası listeyi güncelle
      setProperties(prevProperties => prevProperties.map(property => {
        if (property._id === propertyId) {
          return { ...property, isFavorite: !property.isFavorite };
        }
        return property;
      }));
    } catch (err) {
      console.error('Favori güncelleme hatası:', err);
    }
  }, []);
  
  // Filtre temizleme
  const clearFilters = useCallback(() => {
    setFilters({
      propertyType: '',
      status: '',
      priceMin: '',
      priceMax: '',
      city: '',
    });
    setSearchTerm('');
  }, []);
  
  // Sayfa değiştirme
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Sayfa değiştiğinde sayfanın üstüne kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Benzersiz şehirler listesi
  const cities = useMemo(() => {
    return Array.from(new Set(properties.map(p => p.location.city))).sort();
  }, [properties]);
  
  // Toplam sayfa sayısı
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  }, [filteredProperties.length]);
  
  // Mevcut sayfada gösterilecek gayrimenkuller
  const currentProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);
  
  // Yükleniyor durumu
  if (status === 'loading') {
    return <LoadingSkeletons />;
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-10 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
        
        <LoadingSkeletons />
      </div>
    );
  }

  // Oturum açılmamış durumu
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oturum Gerekli</h2>
          <p className="text-gray-600 mb-6">Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
          <Link 
            href="/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gayrimenkullerim</h1>
        <Link
          href="/dashboard/property/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          <span>Yeni Gayrimenkul</span>
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Gayrimenkul ara..."
              className="w-full p-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-1" />
            <span>Filtreler</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Sırala:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">En Yeni</option>
              <option value="createdAt-asc">En Eski</option>
              <option value="price-asc">Fiyat (Azdan Çoğa)</option>
              <option value="price-desc">Fiyat (Çoktan Aza)</option>
              <option value="size-asc">Alan (Azdan Çoğa)</option>
              <option value="size-desc">Alan (Çoktan Aza)</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emlak Tipi</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="apartment">Daire</option>
                  <option value="house">Müstakil Ev</option>
                  <option value="land">Arsa</option>
                  <option value="commercial">Ticari</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tümü</option>
                  <option value="active">Aktif</option>
                  <option value="sold">Satılmış</option>
                  <option value="rented">Kiralık</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tümü</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Fiyat</label>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                  placeholder="Min. Fiyat"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max. Fiyat</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                  placeholder="Max. Fiyat"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Henüz gayrimenkul eklenmemiş veya arama kriterlerinize uygun sonuç bulunamadı.</p>
          <Link
            href="/dashboard/property/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-1" />
            <span>Yeni Gayrimenkul Ekle</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProperties.map((property) => (
              <PropertyCard 
                key={property._id} 
                property={property} 
                onToggleFavorite={handleToggleFavorite} 
              />
            ))}
          </div>
          
          {/* Sayfalama */}
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
          
          {/* Sonuç sayısı bilgisi */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Toplam {filteredProperties.length} gayrimenkul, {currentPage}/{totalPages} sayfa gösteriliyor
          </div>
        </>
      )}
    </div>
  );
}

// Ana bileşeni React.memo ile sarmalayarak gereksiz render'ları önlüyoruz
const PropertyContentMemo = React.memo(PropertyContent);
PropertyContentMemo.displayName = 'PropertyContentMemo';

export default function PropertyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PropertyContentMemo />
    </Suspense>
  );
} 