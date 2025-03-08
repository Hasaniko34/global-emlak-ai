'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowPathIcon, 
  PlusIcon, 
  ChartPieIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Portfolio {
  _id: string;
  name: string;
  description: string;
  totalValue: number;
  totalIncome: number;
  totalExpenses: number;
  performanceMetrics: {
    overallROI: number;
    cashFlow: number;
    capitalGain: number;
    diversificationScore: number;
  };
  properties: string[];
  createdAt: string;
  updatedAt: string;
}

export const dynamic = 'force-dynamic';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>
  );
}

function PortfolioContent() {
  const { data: session, status } = useSession();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Portföyleri yükle
  const fetchPortfolios = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error('Portföyler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setPortfolios(data.portfolios);
    } catch (err) {
      console.error('Portföy yükleme hatası:', err);
      setError('Portföyler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Portföy silme
  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Bu portföyü silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Portföy silinirken bir hata oluştu');
      }
      
      // Silinen portföyü listeden kaldır
      setPortfolios(portfolios.filter(portfolio => portfolio._id !== id));
    } catch (err) {
      console.error('Portföy silme hatası:', err);
      alert('Portföy silinirken bir hata oluştu');
    }
  };
  
  // Sayfa yüklendiğinde portföyleri al
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPortfolios();
    }
  }, [status]);
  
  // Yükleniyor durumu
  if (status === 'loading' || isLoading) {
    return <LoadingSpinner />;
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Emlak Portföyüm</h1>
          <p className="text-gray-600">Gayrimenkul yatırımlarınızı yönetin ve analiz edin</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchPortfolios}
            className="flex items-center px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Yenile
          </button>
          <Link
            href="/dashboard/portfolio/new"
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Yeni Portföy
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <HomeIcon className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz Portföyünüz Yok</h3>
          <p className="text-gray-600 mb-6">Gayrimenkul yatırımlarınızı yönetmek için yeni bir portföy oluşturun.</p>
          <Link
            href="/dashboard/portfolio/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Portföy Oluştur
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map(portfolio => (
            <div key={portfolio._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{portfolio.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{portfolio.description || 'Açıklama yok'}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toplam Değer</span>
                    <span className="font-semibold">{portfolio.totalValue.toLocaleString('tr-TR')} TL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Aylık Nakit Akışı</span>
                    <span className={`font-semibold ${portfolio.performanceMetrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.performanceMetrics.cashFlow.toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Yatırım Getirisi (ROI)</span>
                    <span className={`font-semibold ${portfolio.performanceMetrics.overallROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      %{portfolio.performanceMetrics.overallROI.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gayrimenkul Sayısı</span>
                    <span className="font-semibold">{portfolio.properties.length}</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Link
                    href={`/dashboard/portfolio/${portfolio._id}`}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Detaylar
                  </Link>
                  <button
                    onClick={() => handleDeletePortfolio(portfolio._id)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Sil
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-3 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ChartPieIcon className="w-5 h-5 text-blue-600 mr-1" />
                    <span className="text-sm text-gray-600">Çeşitlilik: {portfolio.performanceMetrics.diversificationScore}/10</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-1" />
                    <span className="text-sm text-gray-600">Sermaye Kazancı: %{portfolio.performanceMetrics.capitalGain.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PortfolioContent />
    </Suspense>
  );
} 