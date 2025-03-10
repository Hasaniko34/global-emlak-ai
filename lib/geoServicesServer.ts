import fs from 'fs';
import path from 'path';
import { AddressComponent } from '@/types/address';

// Statik veri dosyaları
const DATA_DIR = path.join(process.cwd(), 'data');
const COUNTRIES_FILE = path.join(DATA_DIR, 'countries.json');

// Statik veri yükleme fonksiyonu
export function loadStaticData<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as T;
    }
  } catch (error) {
    console.error(`Statik veri yükleme hatası (${filePath}):`, error);
  }
  return defaultValue;
}

// Ülke verilerini getir
export function getCountryData(countryCode: string): any {
  try {
    const countries = loadStaticData<any[]>(COUNTRIES_FILE, []);
    const country = countries.find(c => c.code === countryCode);
    
    if (country) {
      return country;
    }
    
    return null;
  } catch (error) {
    console.error(`Ülke verisi alınamadı (${countryCode}):`, error);
    return null;
  }
}

// Şehirleri getir
export function getCitiesData(countryCode: string): AddressComponent[] {
  try {
    // Ülkeye göre dosya yolunu belirle
    const citiesFile = path.join(DATA_DIR, `${countryCode.toLowerCase()}_cities.json`);
    
    // Eğer ülkeye özel şehir dosyası varsa, onu kullan
    if (fs.existsSync(citiesFile)) {
      return loadStaticData<AddressComponent[]>(citiesFile, []);
    }
    
    // Ülkeye özel dosya yoksa, tüm şehirleri içeren dosyayı kontrol et
    const allCitiesFile = path.join(DATA_DIR, 'cities.json');
    if (fs.existsSync(allCitiesFile)) {
      const allCities = loadStaticData<Record<string, AddressComponent[]>>(allCitiesFile, {});
      return allCities[countryCode] || [];
    }
    
    return [];
  } catch (error) {
    console.error(`Şehir verisi alınamadı (${countryCode}):`, error);
    return [];
  }
}

// İlçeleri getir
export function getDistrictsData(countryCode: string, city: string): AddressComponent[] {
  try {
    // Ülkeye göre dosya yolunu belirle
    const districtsFile = path.join(DATA_DIR, `${countryCode.toLowerCase()}_districts.json`);
    
    if (fs.existsSync(districtsFile)) {
      const districts = loadStaticData<Record<string, any[]>>(districtsFile, {});
      return districts[city] || [];
    }
    
    return [];
  } catch (error) {
    console.error(`İlçe verisi alınamadı (${countryCode}, ${city}):`, error);
    return [];
  }
}

// Mahalleleri getir
export function getNeighborhoodsData(countryCode: string, city: string, district: string): AddressComponent[] {
  try {
    // Özel durumlar için kontrol
    if (countryCode === 'TR' && city.toLowerCase() === 'istanbul') {
      const istanbulFile = path.join(DATA_DIR, 'tr_istanbul_neighborhoods.json');
      if (fs.existsSync(istanbulFile)) {
        const neighborhoods = loadStaticData<Record<string, AddressComponent[]>>(istanbulFile, {});
        return neighborhoods[district] || [];
      }
    }
    
    // Genel durum için
    const neighborhoodsFile = path.join(DATA_DIR, `${countryCode.toLowerCase()}_neighborhoods.json`);
    
    if (fs.existsSync(neighborhoodsFile)) {
      const neighborhoods = loadStaticData<Record<string, Record<string, AddressComponent[]>>>(neighborhoodsFile, {});
      return (neighborhoods[city] && neighborhoods[city][district]) || [];
    }
    
    return [];
  } catch (error) {
    console.error(`Mahalle verisi alınamadı (${countryCode}, ${city}, ${district}):`, error);
    return [];
  }
}

// Sokakları getir
export function getStreetsData(countryCode: string, city: string, district: string, neighborhood: string): AddressComponent[] {
  try {
    // Sokak verisi için dosya yolunu belirle
    const streetsFile = path.join(DATA_DIR, `${countryCode.toLowerCase()}_streets.json`);
    
    if (fs.existsSync(streetsFile)) {
      const streets = loadStaticData<Record<string, Record<string, Record<string, AddressComponent[]>>>>(streetsFile, {});
      return (streets[city] && streets[city][district] && streets[city][district][neighborhood]) || [];
    }
    
    // Sokak verisi yoksa, varsayılan sokaklar oluştur
    return [
      { label: `${neighborhood} Caddesi`, value: `${neighborhood} Caddesi`, type: 'street' },
      { label: 'Atatürk Caddesi', value: 'Atatürk Caddesi', type: 'street' },
      { label: 'Cumhuriyet Caddesi', value: 'Cumhuriyet Caddesi', type: 'street' },
      { label: 'İstiklal Sokak', value: 'İstiklal Sokak', type: 'street' },
    ];
  } catch (error) {
    console.error(`Sokak verisi alınamadı (${countryCode}, ${city}, ${district}, ${neighborhood}):`, error);
    return [];
  }
} 