'use client';

import { useState, useEffect } from 'react';
import { HomeIcon, ChartBarIcon, MapIcon, ChatBubbleLeftRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState([
    {
      title: 'Toplam Gayrimenkul',
      value: '0',
      icon: HomeIcon,
      color: 'blue',
    },
    {
      title: 'Portföy Sayısı',
      value: '0',
      icon: ChartBarIcon,
      color: 'green',
    },
    {
      title: 'Değerleme Sayısı',
      value: '0',
      icon: ChartBarIcon,
      color: 'purple',
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== 'authenticated') return;
      
      setIsLoading(true);
      try {
        // Gayrimenkul sayısını al
        const propertyResponse = await fetch('/api/property');
        const propertyData = await propertyResponse.json();
        
        // Portföy sayısını al
        const portfolioResponse = await fetch('/api/portfolio');
        const portfolioData = await portfolioResponse.json();
        
        // İstatistikleri güncelle
        setStats([
          {
            title: 'Toplam Gayrimenkul',
            value: propertyData.properties ? propertyData.properties.length.toString() : '0',
            icon: HomeIcon,
            color: 'blue',
          },
          {
            title: 'Portföy Sayısı',
            value: portfolioData.portfolios ? portfolioData.portfolios.length.toString() : '0',
            icon: ChartBarIcon,
            color: 'green',
          },
          {
            title: 'Değerleme Sayısı',
            value: '0', // Şimdilik sabit değer
            icon: ChartBarIcon,
            color: 'purple',
          },
        ]);
      } catch (error) {
        console.error('Dashboard veri yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [status]);

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hoş Geldiniz{session?.user?.name ? `, ${session.user.name}` : ''}</h1>
        <p className="mt-2 text-gray-600">Global Emlak AI ile emlak işlemlerinizi kolaylaştırın</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className={`rounded-2xl bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-${stat.color}-500`}>
            <div className="flex items-center">
              <div className={`rounded-lg bg-${stat.color}-100 p-2 sm:p-3`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{isLoading ? '...' : stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/dashboard/property/new" className="group">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group-hover:bg-blue-50 h-full flex flex-col items-center justify-center text-center">
            <div className="bg-blue-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors">
              <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Yeni Gayrimenkul</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Portföyünüze yeni bir gayrimenkul ekleyin</p>
          </div>
        </Link>
        
        <Link href="/dashboard/portfolio/new" className="group">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group-hover:bg-green-50 h-full flex flex-col items-center justify-center text-center">
            <div className="bg-green-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4 group-hover:bg-green-200 transition-colors">
              <PlusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Yeni Portföy</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Gayrimenkullerinizi gruplandırmak için portföy oluşturun</p>
          </div>
        </Link>
        
        <Link href="/dashboard/evaluate" className="group">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group-hover:bg-purple-50 h-full flex flex-col items-center justify-center text-center">
            <div className="bg-purple-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4 group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Değerleme Yap</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Yapay zeka ile emlak değerlemesi yapın</p>
          </div>
        </Link>
        
        <Link href="/dashboard/map" className="group">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all group-hover:bg-orange-50 h-full flex flex-col items-center justify-center text-center">
            <div className="bg-orange-100 p-3 sm:p-4 rounded-full mb-3 sm:mb-4 group-hover:bg-orange-200 transition-colors">
              <MapIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">3D Harita</h3>
            <p className="text-gray-600 text-xs sm:text-sm">Gayrimenkullerinizi harita üzerinde görüntüleyin</p>
          </div>
        </Link>
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-600 flex-grow">Yeni emlak değerlemesi yapıldı</p>
            <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">2 saat önce</span>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-600 flex-grow">Yeni ilan eklendi</p>
            <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">4 saat önce</span>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm text-gray-600 flex-grow">AI asistan ile görüşme yapıldı</p>
            <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">6 saat önce</span>
          </div>
        </div>
      </div>
    </div>
  );
} 