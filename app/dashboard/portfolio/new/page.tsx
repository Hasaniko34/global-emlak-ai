'use client';

// Force dynamic rendering to prevent prerender errors with useSession
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  isFavorite: boolean;
}

export default function NewPortfolioPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      } catch (err) {
        console.error('Gayrimenkul yükleme hatası:', err);
        setError('Gayrimenkuller yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, []);
  
  // Gayrimenkul seçimi değiştiğinde
  const handlePropertySelection = (propertyId: string) => {
    setSelectedPropertyIds(prevIds => {
      if (prevIds.includes(propertyId)) {
        return prevIds.filter(id => id !== propertyId);
      } else {
        return [...prevIds, propertyId];
      }
    });
  };
  
  // Portföy oluşturma
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Portföy adı zorunludur');
      return;
    }
    
    if (selectedPropertyIds.length === 0) {
      setError('En az bir gayrimenkul seçmelisiniz');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          propertyIds: selectedPropertyIds,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Portföy oluşturulurken bir hata oluştu');
      }
      
      // Başarılı oluşturma sonrası portföy listesine yönlendir
      router.push('/dashboard/portfolio');
    } catch (err: any) {
      console.error('Portföy oluşturma hatası:', err);
      setError(err.message || 'Portföy oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/portfolio"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Portföylere Dön</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Portföy Oluştur</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Portföy Adı <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Yatırım Portföyüm"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Açıklama
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Portföyünüzü açıklayın..."
              rows={3}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Gayrimenkuller <span className="text-red-600">*</span>
            </label>
            <p className="text-gray-600 text-sm mb-3">Portföye eklemek istediğiniz gayrimenkulleri seçin</p>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-700">Henüz eklenmiş gayrimenkulünüz yok. Önce gayrimenkul eklemelisiniz.</p>
                <Link
                  href="/dashboard/property/new"
                  className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Yeni Gayrimenkul Ekle
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                {properties.map((property) => (
                  <div 
                    key={property._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPropertyIds.includes(property._id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handlePropertySelection(property._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{property.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{property.location.address}, {property.location.district}, {property.location.city}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                          </span>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {property.price.toLocaleString('tr-TR')} {property.currency}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            property.status === 'active' ? 'bg-green-100 text-green-700' :
                            property.status === 'sold' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {property.status === 'active' ? 'Aktif' : 
                             property.status === 'sold' ? 'Satılmış' : 'Kiralık'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {property.financials.currentValue && (
                          <p className="font-semibold text-gray-800">{property.financials.currentValue.toLocaleString('tr-TR')} TL</p>
                        )}
                        <div className="mt-2">
                          {selectedPropertyIds.includes(property._id) ? (
                            <span className="inline-flex items-center text-sm font-medium text-blue-600">
                              <XMarkIcon className="w-4 h-4 mr-1" />
                              Kaldır
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-sm font-medium text-blue-600">
                              <PlusIcon className="w-4 h-4 mr-1" />
                              Ekle
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Link
              href="/dashboard/portfolio"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded mr-2 hover:bg-gray-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || properties.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'Portföy Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 