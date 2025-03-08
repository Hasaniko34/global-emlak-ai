'use client';

// Force dynamic rendering to prevent prerender errors with useSession
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ChartBarIcon, TrashIcon, PencilIcon, CurrencyDollarIcon, PlusIcon, HomeIcon } from '@heroicons/react/24/outline';

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
  price: number;
  currency: string;
  status: string;
  financials: {
    currentValue: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  images?: string[];
}

interface Portfolio {
  _id: string;
  name: string;
  description: string;
  properties: Property[];
  totalValue: number;
  totalIncome: number;
  totalExpenses: number;
  overallROI: number;
  cashFlow: number;
  createdAt: string;
  updatedAt: string;
}

export default function PortfolioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Portföy detaylarını yükle
  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/portfolio/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Portföy bulunamadı');
          }
          throw new Error('Portföy bilgileri yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setPortfolio(data.portfolio);
      } catch (err: any) {
        console.error('Portföy detay hatası:', err);
        setError(err.message || 'Portföy bilgileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchPortfolioDetails();
    }
  }, [id]);
  
  // Portföy silme işlemi
  const handleDeletePortfolio = async () => {
    if (!confirm('Bu portföyü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Portföy silinirken bir hata oluştu');
      }
      
      // Başarılı silme sonrası portföy listesine yönlendir
      router.push('/dashboard/portfolio');
    } catch (err: any) {
      console.error('Portföy silme hatası:', err);
      setError(err.message || 'Portföy silinirken bir hata oluştu');
      setIsDeleting(false);
    }
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
            href="/dashboard/portfolio"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Portföylere Dön</span>
          </Link>
        </div>
      </div>
    );
  }
  
  // Portföy bulunamadı
  if (!portfolio) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6 max-w-2xl w-full">
            <p>Portföy bulunamadı veya erişim izniniz yok.</p>
          </div>
          <Link 
            href="/dashboard/portfolio"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Portföylere Dön</span>
          </Link>
        </div>
      </div>
    );
  }
  
  // Portföy detay gösterimi
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/dashboard/portfolio"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Portföylere Dön</span>
        </Link>
        
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/portfolio/${id}/edit`}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            <span>Düzenle</span>
          </Link>
          <button
            onClick={handleDeletePortfolio}
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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="text-gray-600 mt-2">{portfolio.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">
            Oluşturulma: {new Date(portfolio.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-700">Toplam Değer</h3>
            <p className="text-2xl font-bold text-green-800 mt-1">{portfolio.totalValue.toLocaleString('tr-TR')} TL</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700">Aylık Gelir</h3>
            <p className="text-2xl font-bold text-blue-800 mt-1">{portfolio.totalIncome.toLocaleString('tr-TR')} TL</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-700">Aylık Gider</h3>
            <p className="text-2xl font-bold text-red-800 mt-1">{portfolio.totalExpenses.toLocaleString('tr-TR')} TL</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-700">Net Nakit Akışı</h3>
            <p className="text-2xl font-bold text-purple-800 mt-1">{portfolio.cashFlow.toLocaleString('tr-TR')} TL</p>
          </div>
        </div>
        
        <div className="p-6 border-t">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Performans Göstergeleri</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Genel ROI (Yatırım Getirisi)</h3>
              <div className="flex items-end mt-1">
                <p className="text-xl font-bold text-gray-800">%{(portfolio.overallROI * 100).toFixed(2)}</p>
                <p className="text-sm text-gray-500 ml-2">yıllık</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    portfolio.overallROI >= 0.1 ? 'bg-green-600' : 
                    portfolio.overallROI >= 0.05 ? 'bg-green-400' : 
                    portfolio.overallROI >= 0 ? 'bg-yellow-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, portfolio.overallROI * 100))}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Aylık Nakit Akışı / Değer Oranı</h3>
              <div className="flex items-end mt-1">
                <p className="text-xl font-bold text-gray-800">
                  %{((portfolio.cashFlow * 12 / portfolio.totalValue) * 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 ml-2">yıllık</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    (portfolio.cashFlow * 12 / portfolio.totalValue) >= 0.08 ? 'bg-green-600' : 
                    (portfolio.cashFlow * 12 / portfolio.totalValue) >= 0.04 ? 'bg-green-400' : 
                    (portfolio.cashFlow * 12 / portfolio.totalValue) >= 0 ? 'bg-yellow-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (portfolio.cashFlow * 12 / portfolio.totalValue) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-700 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Portföydeki Gayrimenkuller</h2>
            </div>
            <p className="text-sm text-gray-600">Toplam: {portfolio.properties.length}</p>
          </div>
        </div>
        
        {portfolio.properties.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-600">Bu portföyde henüz gayrimenkul bulunmuyor.</p>
            <Link
              href={`/dashboard/portfolio/${id}/edit`}
              className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Gayrimenkul Ekle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gayrimenkul
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip / Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Değer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gelir/Gider
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.properties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center">
                              <HomeIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{property.title}</div>
                          {property.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">{property.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.location.district}, {property.location.city}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{property.location.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        property.status === 'active' ? 'bg-green-100 text-green-700' :
                        property.status === 'sold' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {property.status === 'active' ? 'Aktif' : 
                         property.status === 'sold' ? 'Satılmış' : 'Kiralık'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.financials.currentValue
                          ? property.financials.currentValue.toLocaleString('tr-TR')
                          : property.price.toLocaleString('tr-TR')
                        } TL
                      </div>
                      <div className="text-xs text-gray-500">
                        Alış: {property.price.toLocaleString('tr-TR')} {property.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600">
                        +{property.financials.monthlyIncome.toLocaleString('tr-TR')} TL
                      </div>
                      <div className="text-sm text-red-600">
                        -{property.financials.monthlyExpenses.toLocaleString('tr-TR')} TL
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/property/${property._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Görüntüle
                      </Link>
                      <Link
                        href={`/dashboard/property/${property._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 