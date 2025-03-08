'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => {
    // Google Maps API'yi yükle
    const loadGoogleMapsScript = () => {
      // Kullanıcının .env dosyasındaki anahtarını kullan, yoksa sabit anahtarı kullan
      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAohvaeCg53XYHYdFjoOVIez6KhUPiCHv8';
      
      if (!googleMapsApiKey) {
        setError('Google Maps API anahtarı bulunamadı.');
        setLoading(false);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        if (mapRef.current) {
          initializeMap();
        }
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Google Maps yüklenirken bir hata oluştu.');
        setLoading(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        window.initMap = () => {};
        document.head.removeChild(script);
      };
    };
    
    loadGoogleMapsScript();
  }, []);
  
  const initializeMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 39.925533, lng: 32.866287 }, // Türkiye'nin merkezi
      zoom: 6,
      mapTypeId: window.google.maps.MapTypeId.HYBRID, // 3D görünüm
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });
    
    // Haritaya tıklama olayı ekle
    map.addListener('click', async (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      try {
        // Reverse geocoding ile konum bilgisini al
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, async (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            
            // Marker ekle
            new window.google.maps.Marker({
              position: { lat, lng },
              map,
              title: address,
            });
            
            // API'den bölge bilgilerini al
            try {
              const response = await axios.post('/api/maps', { address });
              setSelectedLocation({
                address,
                coordinates: { lat, lng },
                data: response.data.data,
              });
            } catch (err) {
              console.error('Bölge bilgileri alınamadı:', err);
            }
          } else {
            console.error('Geocoder başarısız oldu:', status);
          }
        });
      } catch (err) {
        console.error('Harita hatası:', err);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-green-700">3D Emlak Haritası</h1>
        <p className="text-gray-600">
          Dünya genelindeki emlak trendlerini keşfedin. Haritada bir noktaya tıklayarak o bölgenin emlak bilgilerini görüntüleyin.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Harita */}
        <div className="flex-1 min-h-[400px] md:min-h-0 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                <p className="mt-2">Harita yükleniyor...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 z-10">
              <div className="text-center text-red-700 p-4">
                <p className="font-bold">Hata</p>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-full"></div>
        </div>
        
        {/* Seçilen bölge bilgileri */}
        {selectedLocation && (
          <div className="w-full md:w-80 p-4 bg-white shadow-md overflow-y-auto">
            <h2 className="text-xl font-semibold mb-3 text-green-700">Bölge Bilgileri</h2>
            <p className="font-medium mb-2">{selectedLocation.address}</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Emlak Piyasası</h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Ortalama Konut Fiyatı</p>
                  <p className="font-medium">1.250.000 TRY</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Ortalama Kira</p>
                  <p className="font-medium">5.500 TRY</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Yıllık Değer Artışı</p>
                  <p className="font-medium text-green-600">%8.5</p>
                </div>
              </div>
            </div>
            
            <button className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              Detaylı Rapor İndir
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 