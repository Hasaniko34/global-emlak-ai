'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    H: any;
  }
}

export default function MapsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    const loadHereMaps = async () => {
      try {
        const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_API_KEY;
        if (!HERE_API_KEY) {
          setError('Here Maps API anahtarı bulunamadı.');
          return;
        }

        // Here Maps JavaScript API'yi yükle
        const script = document.createElement('script');
        script.src = `https://js.api.here.com/v3/3.1/mapsjs-core.js`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          const script2 = document.createElement('script');
          script2.src = `https://js.api.here.com/v3/3.1/mapsjs-service.js`;
          script2.async = true;
          document.head.appendChild(script2);

          script2.onload = () => {
            const script3 = document.createElement('script');
            script3.src = `https://js.api.here.com/v3/3.1/mapsjs-mapevents.js`;
            script3.async = true;
            document.head.appendChild(script3);

            script3.onload = () => {
              initMap();
            };
          };
        };
      } catch (err) {
        setError('Here Maps yüklenirken bir hata oluştu.');
        console.error('Here Maps yükleme hatası:', err);
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;

      // Here Maps platformunu başlat
      const platform = new window.H.service.Platform({
        apikey: process.env.NEXT_PUBLIC_HERE_API_KEY
      });

      // Varsayılan harita katmanlarını al
      const defaultLayers = platform.createDefaultLayers();

      // Haritayı oluştur
      const map = new window.H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          center: { lat: 41.0082, lng: 28.9784 }, // İstanbul koordinatları
          zoom: 12,
          pixelRatio: window.devicePixelRatio || 1
        }
      );

      // Harita etkileşimlerini etkinleştir
      const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));

      // Pencere boyutu değiştiğinde haritayı yeniden boyutlandır
      window.addEventListener('resize', () => map.getViewPort().resize());

      setMap(map);
    };

    loadHereMaps();

    return () => {
      if (map) {
        map.dispose();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Hata</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
} 