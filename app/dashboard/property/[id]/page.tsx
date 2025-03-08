'use client';

// Force dynamic rendering to prevent prerender errors with useSession
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  HeartIcon, 
  PencilIcon, 
  TrashIcon,
  MapPinIcon,
  SquaresPlusIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  location: {
    address: string;
    city: string;
    district: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  features: {
    size: number;
    rooms?: number;
    bathrooms?: number;
    floors?: number;
    yearBuilt?: number;
    heating?: string;
  };
  price: number;
  currency: string;
  status: string;
  isFeatured: boolean;
  isFavorite: boolean;
  financials: {
    currentValue: number;
    purchaseDate?: string;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Gayrimenkul detaylarını yükle
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/property/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Gayrimenkul bulunamadı');
          }
          throw new Error('Gayrimenkul bilgileri yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setProperty(data.property);
      } catch (err: any) {
        console.error('Gayrimenkul detay hatası:', err);
        setError(err.message || 'Gayrimenkul bilgileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);
  
  // Gayrimenkul silme işlemi
  const handleDeleteProperty = async () => {
    if (!confirm('Bu gayrimenkulü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/property/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gayrimenkul silinirken bir hata oluştu');
      }
      
      // Başarılı silme sonrası gayrimenkul listesine yönlendir
      router.push('/dashboard/property');
    } catch (err: any) {
      console.error('Gayrimenkul silme hatası:', err);
      setError(err.message || 'Gayrimenkul silinirken bir hata oluştu');
      setIsDeleting(false);
    }
  };
  
  // Favori değiştirme
  const handleToggleFavorite = async () => {
    if (!property) return;
    
    try {
      const response = await fetch(`/api/property/${id}/favorite`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Favori durumu güncellenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setProperty(prev => prev ? {...prev, isFavorite: data.property.isFavorite} : null);
    } catch (err) {
      console.error('Favori güncelleme hatası:', err);
    }
  };
  
  // Resim galerisi navigasyonu
  const nextImage = () => {
    if (!property || !property.images.length) return;
    setCurrentImageIndex((currentImageIndex + 1) % property.images.length);
  };
  
  const prevImage = () => {
    if (!property || !property.images.length) return;
    setCurrentImageIndex((currentImageIndex - 1 + property.images.length) % property.images.length);
  };
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 max-w-2xl w-full">
            <p>{error}</p>
          </div>
          <Link 
            href="/dashboard/property"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Gayrimenkullere Dön</span>
          </Link>
        </div>
      </div>
    );
  }
  
  // Gayrimenkul bulunamadı
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6 max-w-2xl w-full">
            <p>Gayrimenkul bulunamadı veya erişim izniniz yok.</p>
          </div>
          <Link 
            href="/dashboard/property"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Gayrimenkullere Dön</span>
          </Link>
        </div>
      </div>
    );
  }
  
  // ROI hesaplama (Yıllık)
  const annualIncome = property.financials.monthlyIncome * 12;
  const annualExpenses = property.financials.monthlyExpenses * 12;
  const annualProfit = annualIncome - annualExpenses;
  const roi = (annualProfit / property.financials.currentValue) * 100;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/dashboard/property"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Gayrimenkullere Dön</span>
        </Link>
        
        <div className="flex space-x-2">
          <button
            onClick={handleToggleFavorite}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            {property.isFavorite ? (
              <>
                <HeartIconSolid className="w-4 h-4 mr-1 text-red-500" />
                <span>Favorilerden Çıkar</span>
              </>
            ) : (
              <>
                <HeartIcon className="w-4 h-4 mr-1" />
                <span>Favorilere Ekle</span>
              </>
            )}
          </button>
          <Link
            href={`/dashboard/property/${id}/edit`}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            <span>Düzenle</span>
          </Link>
          <button
            onClick={handleDeleteProperty}
            disabled={isDeleting}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            <span>{isDeleting ? 'Siliniyor...' : 'Sil'}</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative">
              {property.images && property.images.length > 0 ? (
                <div className="relative h-80 sm:h-96">
                  <img 
                    src={property.images[currentImageIndex]}
                    alt={`${property.title} resim ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {property.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md hover:bg-white"
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-md hover:bg-white"
                      >
                        <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                      </button>
                    </>
                  )}
                  
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 sm:h-96 bg-gray-200">
                  <div className="text-center text-gray-400">
                    <PhotoIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>Resim Eklenmemiş</p>
                  </div>
                </div>
              )}
              
              {property.images && property.images.length > 1 && (
                <div className="flex overflow-x-auto p-2 space-x-2 bg-gray-100">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Küçük resim ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{property.location.address}, {property.location.district}, {property.location.city}</span>
                  </div>
                </div>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                  property.status === 'active' ? 'bg-green-100 text-green-700' :
                  property.status === 'sold' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {property.status === 'active' ? 'Aktif' : 
                   property.status === 'sold' ? 'Satılmış' : 'Kiralık'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Tür</div>
                  <div className="font-medium text-gray-800">{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Alan</div>
                  <div className="font-medium text-gray-800">{property.features.size} m²</div>
                </div>
                {property.features.rooms && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Oda Sayısı</div>
                    <div className="font-medium text-gray-800">{property.features.rooms}</div>
                  </div>
                )}
                {property.features.bathrooms && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Banyo</div>
                    <div className="font-medium text-gray-800">{property.features.bathrooms}</div>
                  </div>
                )}
                {property.features.yearBuilt && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Yapım Yılı</div>
                    <div className="font-medium text-gray-800">{property.features.yearBuilt}</div>
                  </div>
                )}
                {property.features.heating && (
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Isıtma</div>
                    <div className="font-medium text-gray-800">{property.features.heating}</div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Açıklama</h2>
                <p className="text-gray-600 whitespace-pre-line">{property.description || 'Açıklama eklenmemiş.'}</p>
              </div>
              
              {property.location.coordinates && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Konum</h2>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Bu özellik için harita görüntüsü henüz mevcut değil.</p>
                    {/* Harita entegrasyonu burada yapılabilir */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h2 className="flex items-center text-lg font-semibold text-gray-800">
                <CurrencyDollarIcon className="w-5 h-5 mr-1 text-green-600" />
                <span>Finansal Bilgiler</span>
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Alış Fiyatı:</span>
                  <span className="font-semibold text-gray-800">{property.price.toLocaleString('tr-TR')} {property.currency}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Mevcut Değer:</span>
                  <span className="font-semibold text-gray-800">{property.financials.currentValue.toLocaleString('tr-TR')} TL</span>
                </div>
                
                {property.financials.purchaseDate && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Alım Tarihi:</span>
                    <span className="font-semibold text-gray-800">{new Date(property.financials.purchaseDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Aylık Gelir:</span>
                  <span className="font-semibold text-green-600">{property.financials.monthlyIncome.toLocaleString('tr-TR')} TL</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Aylık Gider:</span>
                  <span className="font-semibold text-red-600">{property.financials.monthlyExpenses.toLocaleString('tr-TR')} TL</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Aylık Net Gelir:</span>
                  <span className={`font-semibold ${property.financials.monthlyIncome - property.financials.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(property.financials.monthlyIncome - property.financials.monthlyExpenses).toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h2 className="flex items-center text-lg font-semibold text-gray-800">
                <ChartBarIcon className="w-5 h-5 mr-1 text-purple-600" />
                <span>Performans</span>
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">Yatırım Getirisi (ROI):</span>
                  <span className={`font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    %{roi.toFixed(2)} / yıl
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      roi >= 10 ? 'bg-green-600' : 
                      roi >= 5 ? 'bg-green-400' : 
                      roi >= 0 ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, roi * 2))}%` }}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">Nakit Akışı:</span>
                  <span className={`font-semibold ${annualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {annualProfit.toLocaleString('tr-TR')} TL / yıl
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">Değer Artışı:</span>
                  <span className={`font-semibold ${property.financials.currentValue - property.price >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(property.financials.currentValue - property.price).toLocaleString('tr-TR')} TL
                    {' '}
                    ({((property.financials.currentValue - property.price) / property.price * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="flex items-center text-lg font-semibold text-gray-800">
                <SquaresPlusIcon className="w-5 h-5 mr-1 text-blue-600" />
                <span>Portföyler</span>
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Bu gayrimenkul şu portföylere eklenmiş:</p>
                <div className="space-y-2 mb-4">
                  {/* Portföy listesi burada gelecek, şimdilik boş gösteriyoruz */}
                  <p className="text-gray-500 italic">Herhangi bir portföye eklenmemiş.</p>
                </div>
                <Link
                  href={`/dashboard/portfolio/new?propertyId=${property._id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  <span>Yeni Portföye Ekle</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 