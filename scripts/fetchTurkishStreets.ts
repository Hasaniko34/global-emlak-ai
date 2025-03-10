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

// Sabitler
const DATA_DIR = path.join(process.cwd(), 'data');
const API_DELAY = 2000;
const OSM_DELAY = 1500; // OpenStreetMap için daha kısa bekleme süresi

// Rate limiting için yardımcı fonksiyon
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Verileri dosyaya kaydetme fonksiyonu
function saveDataToFile(filename: string, data: any): void {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Veri kaydedildi: ${filePath}`);
  } catch (error) {
    console.error(`❌ Dosya kaydetme hatası: ${error}`);
  }
}

// Verileri oku (eğer varsa)
function readDataFromFile(filename: string): any {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`❌ Dosya okuma hatası: ${error}`);
    return null;
  }
}

// İl ve ilçe verilerini oku
function readDistrictsData(): any {
  return readDataFromFile('tr_districts.json') || {};
}

// Mahalle verilerini oku
function readNeighborhoodsData(): any {
  return readDataFromFile('tr_all_neighborhoods.json') || {};
}

// Mapbox API ile sokak verilerini çek
async function fetchStreetsFromMapbox(cityName: string, districtName: string, neighborhoodName: string): Promise<string[]> {
  try {
    if (!MAPBOX_TOKEN) {
      console.warn('⚠️ MAPBOX_TOKEN bulunamadı, bu kaynak atlanıyor');
      return [];
    }
    
    await sleep(API_DELAY);
    
    const query = `${neighborhoodName}, ${districtName}, ${cityName}, Türkiye`;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    
    console.log(`🔍 Mapbox API sokak sorgusu: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_TOKEN,
        types: 'address,street',
        country: 'TR',
        limit: 100,
        language: 'tr'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.features) {
      const streets = response.data.features
        .filter((feature: any) => 
          feature.place_type && 
          (feature.place_type.includes('address') || feature.place_type.includes('street'))
        )
        .map((feature: any) => {
          // Sokak adını çıkar
          const address = feature.place_name.split(',')[0];
          return address
            .replace(/^No:\s*\d+\s+/, '') // Numara bilgisini kaldır
            .replace(/\s+No:\s*\d+$/, '') // Sondaki numara bilgisini kaldır
            .trim();
        })
        .filter((name: string) => 
          name && 
          name.trim() !== '' && 
          name.length > 3 && // Çok kısa isimleri filtrele
          !name.match(/^\d+$/) // Sadece sayılardan oluşan isimleri filtrele
        );
      
      console.log(`✅ Mapbox'tan ${streets.length} sokak bulundu`);
      return Array.from(new Set(streets));
    }
    
    return [];
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Mapbox API hatası (${error.response?.status || 'Bilinmeyen'}): ${error.message}`);
    } else {
      console.error(`❌ Mapbox API hatası: ${error}`);
    }
    return [];
  }
}

// HERE API ile sokak verilerini çek
async function fetchStreetsFromHere(cityName: string, districtName: string, neighborhoodName: string): Promise<string[]> {
  try {
    if (!HERE_API_KEY) {
      console.warn('⚠️ HERE_API_KEY bulunamadı, bu kaynak atlanıyor');
      return [];
    }
    
    await sleep(API_DELAY);
    
    const query = `${neighborhoodName}, ${districtName}, ${cityName}, Türkiye`;
    const url = 'https://geocode.search.hereapi.com/v1/geocode';
    
    console.log(`🔍 HERE API sokak sorgusu: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        q: query,
        apiKey: HERE_API_KEY,
        limit: 100,
        lang: 'tr',
        types: 'street'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.items) {
      const streets = response.data.items
        .filter((item: any) => {
          const address = item.address;
          return address && address.street;
        })
        .map((item: any) => item.address.street.trim())
        .filter((name: string) => 
          name && 
          name.trim() !== '' && 
          name.length > 3 && 
          !name.match(/^\d+$/)
        );
      
      console.log(`✅ HERE API'dan ${streets.length} sokak bulundu`);
      return Array.from(new Set(streets));
    }
    
    return [];
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ HERE API hatası (${error.response?.status || 'Bilinmeyen'}): ${error.message}`);
    } else {
      console.error(`❌ HERE API hatası: ${error}`);
    }
    return [];
  }
}

// Google Maps API ile sokak verilerini çek
async function fetchStreetsFromGoogle(cityName: string, districtName: string, neighborhoodName: string): Promise<string[]> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('⚠️ GOOGLE_MAPS_API_KEY bulunamadı, bu kaynak atlanıyor');
      return [];
    }
    
    await sleep(API_DELAY);
    
    const query = `${neighborhoodName} sokakları ${districtName} ${cityName}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    
    console.log(`🔍 Google Maps API sokak sorgusu: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        query,
        key: GOOGLE_MAPS_API_KEY,
        language: 'tr',
        region: 'tr',
        type: 'street_address'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.results) {
      const streets = response.data.results
        .filter((result: any) => {
          return result.types && (
            result.types.includes('route') || 
            result.types.includes('street_address')
          );
        })
        .map((result: any) => {
          const addressParts = result.formatted_address.split(',');
          return addressParts[0].trim();
        })
        .filter((name: string) => 
          name && 
          name.trim() !== '' && 
          name.length > 3 && 
          !name.match(/^\d+$/)
        );
      
      console.log(`✅ Google Maps'ten ${streets.length} sokak bulundu`);
      return Array.from(new Set(streets));
    }
    
    return [];
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Google Maps API hatası (${error.response?.status || 'Bilinmeyen'}): ${error.message}`);
    } else {
      console.error(`❌ Google Maps API hatası: ${error}`);
    }
    return [];
  }
}

// OpenStreetMap API ile sokak verilerini çek
async function fetchStreetsFromOSM(cityName: string, districtName: string, neighborhoodName: string): Promise<string[]> {
  try {
    await sleep(OSM_DELAY);
    
    const query = `${neighborhoodName} sokak ${districtName} ${cityName} Türkiye`;
    const url = 'https://nominatim.openstreetmap.org/search';
    
    console.log(`🔍 OpenStreetMap API sokak sorgusu: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 50,
        countrycodes: 'tr',
        'accept-language': 'tr'
      },
      headers: {
        'User-Agent': 'GlobalEmlakAI/1.0'
      },
      timeout: 10000
    });
    
    if (response.data && Array.isArray(response.data)) {
      const streets = response.data
        .filter((item: any) => {
          return item.type === 'highway' || 
                 item.type === 'road' || 
                 item.type === 'street' || 
                 (item.address && item.address.road);
        })
        .map((item: any) => {
          if (item.address && item.address.road) {
            return item.address.road;
          }
          
          // Eğer address içinde sokak bulunamadıysa display_name'den çıkarmayı dene
          if (item.display_name) {
            const parts = item.display_name.split(',');
            if (parts.length > 0) {
              return parts[0].trim();
            }
          }
          
          return '';
        })
        .filter((name: string) => 
          name && 
          name.trim() !== '' && 
          name.length > 3 && 
          !name.match(/^\d+$/)
        );
      
      console.log(`✅ OpenStreetMap'ten ${streets.length} sokak bulundu`);
      return Array.from(new Set(streets));
    }
    
    return [];
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ OpenStreetMap API hatası (${error.response?.status || 'Bilinmeyen'}): ${error.message}`);
    } else {
      console.error(`❌ OpenStreetMap API hatası: ${error}`);
    }
    return [];
  }
}

// Mahalleler için sokak verilerini topla
async function fetchStreetsForNeighborhoods(): Promise<void> {
  try {
    console.log('🚀 Türkiye için sokak verilerini toplama işlemi başlatılıyor...');
    console.log('ℹ️ Sadece OpenStreetMap ve HERE API kullanılacak');
    
    // İl, ilçe ve mahalle verilerini oku
    const neighborhoodsData = readNeighborhoodsData();
    
    // Mevcut sokak verilerini oku (eğer varsa)
    const existingStreetsData = readDataFromFile('tr_all_streets.json') || {};
    
    // Tüm sokak verilerini tutacak nesne
    const allStreetsData: Record<string, Record<string, Record<string, string[]>>> = existingStreetsData;
    
    // Kaç mahalle ve sokak verisi doldurulduğunu takip et
    let processedCities = 0;
    let processedDistricts = 0;
    let processedNeighborhoods = 0;
    let totalStreets = 0;
    
    // Öncelikli illeri belirle (turistik ve büyükşehirler)
    const priorityCities = [
      'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Muğla', 'Bursa', 'Kocaeli'
    ];
    
    // Önce öncelikli illeri işle
    for (const cityName of priorityCities) {
      console.log(`🏙️ ${cityName} ili için sokak verilerini toplama başlanıyor...`);
      
      if (!neighborhoodsData[cityName]) {
        console.log(`⚠️ ${cityName} için mahalle verisi bulunamadı, atlanıyor...`);
        continue;
      }
      
      // İl için sokak verisi yapısını oluştur
      if (!allStreetsData[cityName]) {
        allStreetsData[cityName] = {};
      }
      
      const districts = Object.keys(neighborhoodsData[cityName]);
      
      for (const districtName of districts) {
        console.log(`  🏢 ${districtName} ilçesi için sokak verilerini toplama başlanıyor...`);
        
        // İlçe için sokak verisi yapısını oluştur
        if (!allStreetsData[cityName][districtName]) {
          allStreetsData[cityName][districtName] = {};
        }
        
        const neighborhoods = neighborhoodsData[cityName][districtName] || [];
        
        // Her mahalle için
        for (const neighborhoodName of neighborhoods) {
          try {
            console.log(`    🏘️ ${neighborhoodName} mahallesi için sokak verilerini toplama başlanıyor...`);
            
            // Eğer bu mahalle için sokak verisi yoksa
            if (!allStreetsData[cityName][districtName][neighborhoodName]) {
              // Sadece OpenStreetMap ve HERE API'den sokak verilerini topla
              let streets: string[] = [];
              
              // OpenStreetMap API
              const osmStreets = await fetchStreetsFromOSM(cityName, districtName, neighborhoodName);
              streets = streets.concat(osmStreets);
              
              // HERE API
              if (streets.length < 10) { // Eğer yeterli veri yoksa HERE API'yi dene
                const hereStreets = await fetchStreetsFromHere(cityName, districtName, neighborhoodName);
                streets = streets.concat(hereStreets);
              }
              
              // Tekrarlanan sokak isimlerini kaldır
              const uniqueStreets = Array.from(new Set(streets));
              
              if (uniqueStreets.length > 0) {
                allStreetsData[cityName][districtName][neighborhoodName] = uniqueStreets;
                processedNeighborhoods++;
                totalStreets += uniqueStreets.length;
                
                console.log(`    ✅ ${neighborhoodName} mahallesi için ${uniqueStreets.length} sokak bulundu.`);
                
                // Her 3 mahalle sonrası verileri kaydet
                if (processedNeighborhoods % 3 === 0) {
                  saveDataToFile('tr_all_streets.json', allStreetsData);
                  saveDataToFile(`tr_${cityName.toLowerCase()}_streets.json`, allStreetsData[cityName]);
                }
              } else {
                console.log(`    ⚠️ ${neighborhoodName} mahallesi için sokak verisi bulunamadı.`);
              }
            } else {
              console.log(`    ℹ️ ${neighborhoodName} mahallesi için sokak verisi zaten mevcut.`);
            }
          } catch (error) {
            console.error(`    ❌ ${neighborhoodName} mahallesi işlenirken hata oluştu:`, error);
            continue;
          }
        }
        
        processedDistricts++;
        
        // Her ilçe sonrası verileri kaydet
        saveDataToFile(`tr_${cityName.toLowerCase()}_${districtName.toLowerCase()}_streets.json`, allStreetsData[cityName][districtName]);
      }
      
      processedCities++;
      
      // Her il sonrası verileri kaydet
      saveDataToFile(`tr_${cityName.toLowerCase()}_streets.json`, allStreetsData[cityName]);
      saveDataToFile('tr_all_streets.json', allStreetsData);
    }
    
    console.log(`
📊 İşlem Özeti:
✅ İşlenen il sayısı: ${processedCities}
✅ İşlenen ilçe sayısı: ${processedDistricts}
✅ İşlenen mahalle sayısı: ${processedNeighborhoods}
📝 Toplam eklenen sokak sayısı: ${totalStreets}
    `);
    
  } catch (error) {
    console.error(`❌ Sokak verisi toplama hatası: ${error}`);
  }
}

// Ana fonksiyon
async function main(): Promise<void> {
  try {
    // Sokak verilerini topla
    await fetchStreetsForNeighborhoods();
    
    console.log('✅ Tüm işlemler tamamlandı.');
  } catch (error) {
    console.error('❌ Ana işlem hatası:', error);
  }
}

// Programı başlat
main(); 