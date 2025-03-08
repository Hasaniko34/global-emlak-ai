'use client';

import { useState, useEffect } from 'react';
import { MapIcon, BuildingOfficeIcon, HomeIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function MapPage() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Harita yüklendiğinde loading durumunu kaldır
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sol Panel */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">3D Harita</h1>
              <p className="text-gray-600">Emlakları 3D olarak görüntüleyin</p>
            </div>
          </div>

          {/* Filtreler */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="apartments" className="rounded text-blue-600" />
              <label htmlFor="apartments" className="text-sm text-gray-700">Daireler</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="houses" className="rounded text-blue-600" />
              <label htmlFor="houses" className="text-sm text-gray-700">Müstakil Evler</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="commercial" className="rounded text-blue-600" />
              <label htmlFor="commercial" className="text-sm text-gray-700">Ticari Binalar</label>
            </div>
          </div>

          {/* Emlak Listesi */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Yakındaki Emlaklar</h2>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all"
                onClick={() => setSelectedProperty(item)}
              >
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HomeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Örnek Emlak {item}</h3>
                    <p className="text-sm text-gray-600">3+1 Daire</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>Örnek Mahallesi, İstanbul</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-blue-600">2.500.000 TL</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Harita Alanı */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">3D Harita Yükleniyor</h3>
              <p className="text-sm text-gray-500 mt-2">Bu özellik yakında kullanıma sunulacak</p>
            </div>
          </div>
        )}
      </div>

      {/* Seçili Emlak Detayları */}
      {selectedProperty && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Seçili Emlak Detayları</h3>
                <p className="text-sm text-gray-600">Örnek Mahallesi, İstanbul</p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Kapat</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Fiyat</p>
                <p className="text-lg font-medium text-blue-600">2.500.000 TL</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Oda Sayısı</p>
                <p className="text-lg font-medium text-gray-900">3+1</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Metrekare</p>
                <p className="text-lg font-medium text-gray-900">120m²</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 