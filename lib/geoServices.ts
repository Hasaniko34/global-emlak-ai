import { AddressComponent, AddressSearchParams } from '@/types/address';
import axios from 'axios';

// Önbellek mekanizması
const cache = {
  cities: {} as Record<string, AddressComponent[]>,
  districts: {} as Record<string, AddressComponent[]>,
  neighborhoods: {} as Record<string, AddressComponent[]>,
  streets: {} as Record<string, AddressComponent[]>,
};

// Önbellek süresi (30 dakika)
const CACHE_TTL = 30 * 60 * 1000;
const cacheTimestamps = {
  cities: {} as Record<string, number>,
  districts: {} as Record<string, number>,
  neighborhoods: {} as Record<string, number>,
  streets: {} as Record<string, number>,
};

// Cache kontrol fonksiyonu
function isCacheValid(type: 'cities' | 'districts' | 'neighborhoods' | 'streets', key: string): boolean {
  const timestamp = cacheTimestamps[type][key];
  return timestamp ? (Date.now() - timestamp < CACHE_TTL) : false;
}

// Here API yardımcı fonksiyonu
async function fetchFromHereAPI(endpoint: string, query: Record<string, string>): Promise<any> {
  try {
    const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_API_KEY;
    
    if (!HERE_API_KEY) {
      console.error('HERE_API_KEY bulunamadı');
      return { items: [] };
    }
    
    // API URL'yi oluştur
    const url = `https://${endpoint}.search.hereapi.com/v1/${endpoint}`;
    
    // Query parametrelerini düzenle
    const cleanQuery = { ...query };
    
    // Koordinat formatını düzelt
    if (cleanQuery.at && typeof cleanQuery.at === 'string') {
      const [lat, lng] = cleanQuery.at.split(',');
      if (lat && lng) {
        cleanQuery.at = `${parseFloat(lat).toFixed(6)},${parseFloat(lng).toFixed(6)}`;
      } else {
        // Geçersiz koordinat formatı, varsayılan İstanbul koordinatlarını kullan
        cleanQuery.at = '41.015137,28.979530';
      }
    }
    
    // Özel karakterleri temizle
    if (cleanQuery.q) {
      cleanQuery.q = cleanQuery.q.replace(/[^\w\s,]/g, ' ').trim();
    }
    
    // Browse API için özel düzeltmeler
    if (endpoint === 'browse') {
      // Browse API için at parametresi zorunlu, name yerine q kullan
      if (cleanQuery.name) {
        cleanQuery.q = cleanQuery.name;
        delete cleanQuery.name;
      }
      
      // Kategori formatını düzelt
      if (cleanQuery.categories) {
        cleanQuery.categories = cleanQuery.categories.replace(/,/g, ',');
      }
    }
    
    // API isteğini logla
    console.log('🔍 Here API isteği:', url, cleanQuery);
    
    const response = await axios.get(url, {
      params: {
        ...cleanQuery,
        apiKey: HERE_API_KEY
      },
      timeout: 8000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.data) {
      console.warn('API boş yanıt döndürdü');
      return { items: [] };
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Here API hatası:', error.message);
    return { items: [] };
  }
}

// Client-side veri alma fonksiyonları
export async function getCountryDetails(countryCode: string): Promise<any> {
  try {
    // API endpoint'ini çağır
    const response = await fetch(`/api/geo/country?code=${countryCode}`);
    if (!response.ok) {
      throw new Error('Ülke verileri alınamadı');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Ülke detayları alınamadı (${countryCode}):`, error);
    return null;
  }
}

// Şehirleri almak için API endpoint'i
export async function getCitiesByCountryHere(countryCode: string): Promise<AddressComponent[]> {
  // Önbellekten kontrol et
  const cacheKey = countryCode.toLowerCase();
  if (isCacheValid('cities', cacheKey) && cache.cities[cacheKey]) {
    console.log(`📋 Önbellekten şehir verileri alındı: ${countryCode}`);
    return cache.cities[cacheKey];
  }
  
  try {
    // API endpoint'ini çağır
    const response = await fetch(`/api/geo/cities?country=${countryCode}`);
    if (!response.ok) {
      throw new Error('Şehir verileri alınamadı');
    }
    
    const cities = await response.json();
    
    // Sonuçları önbelleğe kaydet
    cache.cities[cacheKey] = cities;
    cacheTimestamps.cities[cacheKey] = Date.now();
    
    return cities;
  } catch (error) {
    console.error(`Şehir bilgileri alınamadı (${countryCode}):`, error);
    return [];
  }
}

// İlçeleri almak için API endpoint'i
export async function getDistrictsByCity(countryCode: string, city: string): Promise<AddressComponent[]> {
  // Önbellekten kontrol et
  const cacheKey = `${countryCode.toLowerCase()}_${city.toLowerCase()}`;
  if (isCacheValid('districts', cacheKey) && cache.districts[cacheKey]) {
    console.log(`📋 Önbellekten ilçe verileri alındı: ${city}, ${countryCode}`);
    return cache.districts[cacheKey];
  }
  
  try {
    // API endpoint'ini çağır
    const response = await fetch(`/api/geo/districts?country=${countryCode}&city=${encodeURIComponent(city)}`);
    if (!response.ok) {
      throw new Error('İlçe verileri alınamadı');
    }
    
    const districts = await response.json();
    
    // Sonuçları önbelleğe kaydet
    cache.districts[cacheKey] = districts;
    cacheTimestamps.districts[cacheKey] = Date.now();
    
    return districts;
  } catch (error) {
    console.error(`İlçe bilgileri alınamadı (${city}, ${countryCode}):`, error);
    return [];
  }
}

// Mahalleleri almak için API endpoint'i
export async function getNeighborhoodsByDistrict(countryCode: string, city: string, district: string): Promise<AddressComponent[]> {
  // Önbellekten kontrol et
  const cacheKey = `${countryCode.toLowerCase()}_${city.toLowerCase()}_${district.toLowerCase()}`;
  if (isCacheValid('neighborhoods', cacheKey) && cache.neighborhoods[cacheKey]) {
    console.log(`📋 Önbellekten mahalle verileri alındı: ${district}, ${city}, ${countryCode}`);
    return cache.neighborhoods[cacheKey];
  }
  
  try {
    // API endpoint'ini çağır
    const response = await fetch(`/api/geo/neighborhoods?country=${countryCode}&city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}`);
    if (!response.ok) {
      throw new Error('Mahalle verileri alınamadı');
    }
    
    const neighborhoods = await response.json();
    
    // Sonuçları önbelleğe kaydet
    cache.neighborhoods[cacheKey] = neighborhoods;
    cacheTimestamps.neighborhoods[cacheKey] = Date.now();
    
    return neighborhoods;
  } catch (error) {
    console.error(`Mahalle bilgileri alınamadı (${district}, ${city}, ${countryCode}):`, error);
    return [];
  }
}

// Sokakları almak için API endpoint'i
export async function getStreetsByNeighborhood(countryCode: string, city: string, district: string, neighborhood: string): Promise<AddressComponent[]> {
  // Önbellekten kontrol et
  const cacheKey = `${countryCode.toLowerCase()}_${city.toLowerCase()}_${district.toLowerCase()}_${neighborhood.toLowerCase()}`;
  if (isCacheValid('streets', cacheKey) && cache.streets[cacheKey]) {
    console.log(`📋 Önbellekten sokak verileri alındı: ${neighborhood}, ${district}, ${city}, ${countryCode}`);
    return cache.streets[cacheKey];
  }
  
  try {
    // API endpoint'ini çağır
    const response = await fetch(`/api/geo/streets?country=${countryCode}&city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}&neighborhood=${encodeURIComponent(neighborhood)}`);
    if (!response.ok) {
      throw new Error('Sokak verileri alınamadı');
    }
    
    const streets = await response.json();
    
    // Sonuçları önbelleğe kaydet
    cache.streets[cacheKey] = streets;
    cacheTimestamps.streets[cacheKey] = Date.now();
    
    return streets;
  } catch (error) {
    console.error(`Sokak bilgileri alınamadı (${neighborhood}, ${district}, ${city}, ${countryCode}):`, error);
    return [];
  }
} 