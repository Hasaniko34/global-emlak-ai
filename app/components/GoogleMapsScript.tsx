'use client';

import { useEffect } from 'react';

export default function GoogleMapsScript() {
  useEffect(() => {
    // API anahtarını ENV'den al, kullanıcının orijinal anahtarını kullan
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAohvaeCg53XYHYdFjoOVIez6KhUPiCHv8';
    
    // Eğer script zaten yüklenmişse yeniden ekleme
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps API yüklendi');
    };
    script.onerror = () => {
      console.error('Google Maps API yüklenirken hata oluştu, API anahtarınızı kontrol edin');
    };
    document.head.appendChild(script);

    return () => {
      // Component unmount olduğunda script'i temizle
      const loadedScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (loadedScript && loadedScript.parentNode) {
        loadedScript.parentNode.removeChild(loadedScript);
      }
    };
  }, []);

  return null;
} 