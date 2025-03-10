import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

// API anahtarları
const MAPBOX_TOKEN = process.env.MAPBOX_API_KEY;
const HERE_API_KEY = process.env.HERE_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Veri klasörü
const DATA_DIR = path.join(process.cwd(), 'data');

// Ülke listesi
const COUNTRIES = [
  { code: 'DE', name: 'Germany', mainCities: [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt',
    'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'
  ]},
  { code: 'GB', name: 'United Kingdom', mainCities: [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
    'Liverpool', 'Bristol', 'Sheffield', 'Edinburgh', 'Cardiff'
  ]},
  { code: 'FR', name: 'France', mainCities: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice',
    'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
  ]},
  { code: 'IT', name: 'Italy', mainCities: [
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo',
    'Genoa', 'Bologna', 'Florence', 'Venice', 'Verona'
  ]},
  { code: 'ES', name: 'Spain', mainCities: [
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza',
    'Málaga', 'Murcia', 'Palma', 'Bilbao', 'Alicante'
  ]}
];

// Mapbox'tan veri çekme fonksiyonu
async function fetchFromMapbox(query: string, types: string[], country: string): Promise<any> {
  try {
    if (!MAPBOX_TOKEN) {
      throw new Error('MAPBOX_TOKEN bulunamadı');
    }
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    
    console.log(`🔍 Mapbox API isteği: ${url} - Query: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_TOKEN,
        types: types.join(','),
        country: country.toLowerCase(),
        limit: 50,
        language: 'tr'
      },
      timeout: 10000
    });
    
    if (!response.data) {
      throw new Error('API boş yanıt döndürdü');
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`Mapbox API hatası:`, error.message);
    return null;
  }
}

// Here API'den veri çekme fonksiyonu
async function fetchFromHere(query: string, country: string): Promise<any> {
  try {
    if (!HERE_API_KEY) {
      throw new Error('HERE_API_KEY bulunamadı');
    }

    const url = 'https://geocode.search.hereapi.com/v1/geocode';
    
    console.log(`🔍 Here API isteği: ${url} - Query: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        q: query,
        apiKey: HERE_API_KEY,
        lang: 'tr',
        limit: 50
      },
      timeout: 15000
    });

    if (!response.data) {
      throw new Error('API boş yanıt döndürdü');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Here API hatası:`, error.message);
    return null;
  }
}

// Google Maps API'den veri çekme fonksiyonu
async function fetchFromGoogle(query: string, country: string): Promise<any> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY bulunamadı');
    }

    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    
    console.log(`🔍 Google Maps API isteği: ${url} - Query: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        address: query,
        components: `country:${country}`,
        language: 'tr',
        key: GOOGLE_MAPS_API_KEY
      },
      timeout: 15000
    });

    if (!response.data) {
      throw new Error('API boş yanıt döndürdü');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Google Maps API hatası:`, error.message);
    return null;
  }
}

// İlçe verilerini çekme (tüm API'leri dene)
async function fetchDistrictsData(cityName: string, countryCode: string): Promise<any[]> {
  try {
    // Önce Mapbox'tan dene
    const mapboxData = await fetchFromMapbox(
      `${cityName}, ${countryCode}`,
      ['district', 'locality', 'place', 'neighborhood'],
      countryCode
    );

    if (mapboxData?.features?.length > 0) {
      return mapboxData.features
        .filter((feature: any) => 
          feature.place_type.includes('district') || 
          feature.place_type.includes('locality') || 
          feature.place_type.includes('place')
        )
        .map((district: any) => ({
          title: district.text,
          position: {
            lat: district.center[1],
            lng: district.center[0]
          }
        }));
    }

    // Mapbox başarısız olursa Here API'yi dene
    const hereData = await fetchFromHere(
      `${cityName} districts ${countryCode}`,
      countryCode
    );

    if (hereData?.items?.length > 0) {
      return hereData.items
        .filter((item: any) => 
          (item.resultType === 'administrativeArea' || 
           item.resultType === 'district' || 
           item.resultType === 'city' || 
           item.resultType === 'street' || 
           item.resultType === 'place') && 
          (item.address.city?.toLowerCase() === cityName.toLowerCase() || 
           item.address.label?.toLowerCase().includes(cityName.toLowerCase()))
        )
        .map((district: any) => ({
          title: district.address.district || district.title || district.address.label || district.address.city,
          position: {
            lat: district.position.lat,
            lng: district.position.lng
          }
        }));
    }

    // Here API de başarısız olursa Google Maps'i dene
    const googleData = await fetchFromGoogle(
      `${cityName} districts ${countryCode}`,
      countryCode
    );

    if (googleData?.results?.length > 0) {
      return googleData.results
        .filter((result: any) => 
          result.types.includes('administrative_area_level_2') || 
          result.types.includes('sublocality') || 
          result.types.includes('neighborhood') || 
          result.types.includes('locality') ||
          result.types.includes('political')
        )
        .map((district: any) => {
          // İlçe adını bul
          let districtTitle = '';
          
          // Adres bileşenlerinden ilçe adını bul
          for (const component of district.address_components) {
            if (
              component.types.includes('administrative_area_level_2') || 
              component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality') || 
              component.types.includes('neighborhood') ||
              component.types.includes('locality')
            ) {
              districtTitle = component.long_name;
              break;
            }
          }
          
          // Eğer ilçe adı bulunamadıysa, biçimlendirilmiş adresi kullan
          if (!districtTitle) {
            districtTitle = district.formatted_address;
          }
          
          return {
            title: districtTitle,
            position: {
              lat: district.geometry.location.lat,
              lng: district.geometry.location.lng
            }
          };
        });
    }

    // Hiçbir API başarılı olamadıysa boş dizi döndür
    return [];
  } catch (error: any) {
    console.error(`İlçe verisi çekilirken hata oluştu: ${error.message}`);
    return [];
  }
}

// Mahalle verilerini çekme (tüm API'leri dene)
async function fetchNeighborhoodsData(district: string, city: string, countryCode: string): Promise<any[]> {
  try {
    // Önce Mapbox'tan dene
    const mapboxData = await fetchFromMapbox(
      `${district}, ${city}, ${countryCode}`,
      ['neighborhood', 'locality', 'place', 'address'],
      countryCode
    );

    if (mapboxData?.features?.length > 0) {
      return mapboxData.features
        .filter((feature: any) => 
          feature.place_type.includes('neighborhood') || 
          feature.place_type.includes('locality') || 
          feature.place_type.includes('place') || 
          feature.place_type.includes('address')
        )
        .map((neighborhood: any) => ({
          label: neighborhood.place_name,
          value: neighborhood.text,
          type: neighborhood.place_type[0],
          position: {
            lat: neighborhood.center[1],
            lng: neighborhood.center[0]
          }
        }));
    }

    // Mapbox başarısız olursa Here API'yi dene
    const hereData = await fetchFromHere(
      `${district} ${city} neighborhoods ${countryCode}`,
      countryCode
    );

    if (hereData?.items?.length > 0) {
      return hereData.items
        .filter((item: any) => 
          (item.resultType === 'administrativeArea' || 
           item.resultType === 'district' || 
           item.resultType === 'street' || 
           item.resultType === 'place') && 
          (item.address.district?.toLowerCase() === district.toLowerCase() || 
           item.address.subdistrict?.toLowerCase() === district.toLowerCase() || 
           item.address.label?.toLowerCase().includes(district.toLowerCase()))
        )
        .map((neighborhood: any) => ({
          label: neighborhood.address.label,
          value: neighborhood.address.subdistrict || neighborhood.address.district || neighborhood.title,
          type: neighborhood.resultType,
          position: {
            lat: neighborhood.position.lat,
            lng: neighborhood.position.lng
          }
        }));
    }

    // Here API de başarısız olursa Google Maps'i dene
    const googleData = await fetchFromGoogle(
      `${district} ${city} neighborhoods ${countryCode}`,
      countryCode
    );

    if (googleData?.results?.length > 0) {
      return googleData.results
        .filter((result: any) => 
          result.types.includes('sublocality') || 
          result.types.includes('neighborhood') || 
          result.types.includes('locality') ||
          result.types.includes('route') ||
          result.types.includes('political')
        )
        .map((neighborhood: any) => {
          // Mahalle adını bul
          let neighborhoodName = '';
          let neighborhoodType = '';
          
          // Adres bileşenlerinden mahalle adını bul
          for (const component of neighborhood.address_components) {
            if (
              component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality') || 
              component.types.includes('neighborhood')
            ) {
              neighborhoodName = component.long_name;
              neighborhoodType = component.types[0];
              break;
            }
          }
          
          // Eğer mahalle adı bulunamadıysa, biçimlendirilmiş adresi kullan
          if (!neighborhoodName) {
            neighborhoodName = neighborhood.formatted_address;
            neighborhoodType = 'address';
          }
          
          return {
            label: neighborhood.formatted_address,
            value: neighborhoodName,
            type: neighborhoodType,
            position: {
              lat: neighborhood.geometry.location.lat,
              lng: neighborhood.geometry.location.lng
            }
          };
        });
    }

    // Hiçbir API başarılı olamadıysa boş dizi döndür
    return [];
  } catch (error: any) {
    console.error(`Mahalle verisi çekilirken hata oluştu: ${error.message}`);
    return [];
  }
}

// Veriyi dosyaya kaydetme
function saveDataToFile(filename: string, data: any): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Veri başarıyla kaydedildi: ${filePath}`);
  } catch (error) {
    console.error(`Dosya kaydetme hatası (${filename}):`, error);
  }
}

// Ana fonksiyon
async function main() {
  console.log('🌍 Coğrafi veri çekme işlemi başlatılıyor...');
  
  for (const country of COUNTRIES) {
    console.log(`\n🏳️ ${country.name} (${country.code}) için veri çekme işlemi başlıyor...`);
    
    const cities: Record<string, any[]> = {};
    const allNeighborhoods: Record<string, Record<string, any[]>> = {};
    
    for (const cityName of country.mainCities) {
      console.log(`\n🏙️ ${cityName}, ${country.name} için veri çekiliyor...`);
      
      // İlçe verilerini çek
      const cityDistricts = await fetchDistrictsData(cityName, country.code);
      if (cityDistricts.length > 0) {
        cities[cityName] = cityDistricts;
        allNeighborhoods[cityName] = {};
        
        // Her ilçe için mahalle verilerini çek
        for (const district of cityDistricts) {
          console.log(`🏘️ ${district.title} ilçesi için mahalleler çekiliyor...`);
          
          const neighborhoods = await fetchNeighborhoodsData(district.title, cityName, country.code);
          if (neighborhoods.length > 0) {
            allNeighborhoods[cityName][district.title] = neighborhoods;
          }
          
          // API sınırlamaları için bekle
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // API sınırlamaları için bekle
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Şehir ve ilçe verilerini kaydet
    saveDataToFile(
      `${country.code.toLowerCase()}_districts.json`,
      cities
    );
    
    // Mahalle verilerini kaydet
    saveDataToFile(
      `${country.code.toLowerCase()}_neighborhoods.json`,
      allNeighborhoods
    );
    
    console.log(`✅ ${country.name} için veri çekme işlemi tamamlandı!`);
    
    // Ülkeler arası geçişte bekle
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n✨ Tüm coğrafi veri çekme işlemleri tamamlandı!');
}

// Hata yönetimi
process.on('unhandledRejection', (error) => {
  console.error('❌ İşlenmemiş hata:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Yakalanmamış istisna:', error);
});

// Scripti çalıştır
main().catch(error => {
  console.error('❌ Ana hata:', error);
  process.exit(1);
}); 