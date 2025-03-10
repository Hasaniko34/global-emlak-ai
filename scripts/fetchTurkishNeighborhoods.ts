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
const OSM_DELAY = 1500; // OpenStreetMap için daha kısa bekleme süresi (rate limit politikası)

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
  } catch (error) {
    console.error(`❌ Dosya okuma hatası: ${error}`);
  }
  return null;
}

// İlçe verilerini oku
function readDistrictsData(): any {
  const filePath = path.join(DATA_DIR, 'tr_districts.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return {};
}

// Mevcut mahalle verilerini kontrol et
function getExistingNeighborhoodsFiles(): string[] {
  const files = fs.readdirSync(DATA_DIR);
  return files.filter(file => file.startsWith('tr_') && file.endsWith('_neighborhoods.json'));
}

// Mapbox'tan veri çekme fonksiyonu
async function fetchNeighborhoodsFromMapbox(query: string, country: string = 'TR'): Promise<string[]> {
  try {
    if (!MAPBOX_TOKEN) {
      console.warn('⚠️ MAPBOX_TOKEN bulunamadı, bu kaynak atlanıyor');
      return [];
    }
    
    await sleep(API_DELAY);
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query + ' mahallesi')}.json`;
    
    console.log(`🔍 Mapbox API mahalle sorgusu: ${query}`);
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_TOKEN,
        types: 'neighborhood,locality',
        country,
        limit: 100,
        language: 'tr'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.features) {
      const neighborhoods = response.data.features
        .filter((feature: any) => 
          feature.place_type && 
          (feature.place_type.includes('neighborhood') || feature.place_type.includes('locality'))
        )
        .map((feature: any) => feature.text)
        .filter((name: string) => name && name.trim() !== '')
        .map((name: string) => 
          name.replace(/\sMahallesi$/i, '')
            .replace(/\sMah\.?$/i, '')
            .replace(/\sMh\.?$/i, '')
            .trim()
        );
      
      console.log(`✅ Mapbox'tan ${neighborhoods.length} mahalle bulundu`);
      return Array.from(new Set(neighborhoods));
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

// HERE API ile mahalle verilerini çekmek
async function fetchNeighborhoodsFromHere(query: string, country: string = 'TUR'): Promise<string[]> {
  try {
    if (!HERE_API_KEY) {
      console.warn('⚠️ HERE_API_KEY bulunamadı, bu kaynak atlanıyor');
      return [];
    }
    
    await sleep(API_DELAY);
    
    const url = 'https://geocode.search.hereapi.com/v1/geocode';
    
    console.log(`🔍 HERE API mahalle sorgusu: ${query}`);
    
    // İlk sorgu - mahalle araması
    const response1 = await axios.get(url, {
      params: {
        q: `${query} mahallesi`,
        apiKey: HERE_API_KEY,
        limit: 50,
        lang: 'tr',
        in: `countryCode:${country}`,
        types: 'area'
      },
      timeout: 10000
    });
    
    // İkinci sorgu - bölge araması
    const response2 = await axios.get(url, {
      params: {
        q: query,
        apiKey: HERE_API_KEY,
        limit: 50,
        lang: 'tr',
        in: `countryCode:${country}`,
        types: 'area'
      },
      timeout: 10000
    });
    
    const results = [];
    
    // İlk sorgunun sonuçlarını işle
    if (response1.data && response1.data.items) {
      const neighborhoods1 = response1.data.items
        .filter((item: any) => {
          const address = item.address;
          return address && 
            (address.district || address.subdistrict || address.street) && 
            (!address.postalCode || address.postalCode.startsWith('TR'));
        })
        .map((item: any) => {
          const address = item.address;
          const name = address.district || address.subdistrict || address.street;
          return name
            .replace(/\sMahallesi$/i, '')
            .replace(/\sMah\.?$/i, '')
            .replace(/\sMh\.?$/i, '')
            .trim();
        })
        .filter((name: string) => name && name.trim() !== '');
      
      results.push(...neighborhoods1);
    }
    
    // İkinci sorgunun sonuçlarını işle
    if (response2.data && response2.data.items) {
      const neighborhoods2 = response2.data.items
        .filter((item: any) => {
          const address = item.address;
          const title = item.title || '';
          return address && 
            (
              (address.district || address.subdistrict || address.street) ||
              title.toLowerCase().includes('mahallesi') ||
              title.toLowerCase().includes('mah.')
            ) && 
            (!address.postalCode || address.postalCode.startsWith('TR'));
        })
        .map((item: any) => {
          const name = item.title || item.address.district || item.address.subdistrict || item.address.street;
          return name
            .replace(/\sMahallesi$/i, '')
            .replace(/\sMah\.?$/i, '')
            .replace(/\sMh\.?$/i, '')
            .trim();
        })
        .filter((name: string) => name && name.trim() !== '');
      
      results.push(...neighborhoods2);
    }
    
    // Sonuçları birleştir ve tekrar edenleri kaldır
    const uniqueNeighborhoods = Array.from(new Set(results));
    
    console.log(`✅ HERE API'dan ${uniqueNeighborhoods.length} mahalle bulundu`);
    return uniqueNeighborhoods;
    
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ HERE API hatası (${error.response?.status || 'Bilinmeyen'}): ${error.message}`);
      if (error.response?.data) {
        console.error('Hata detayı:', JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.error(`❌ HERE API hatası: ${error}`);
    }
    return [];
  }
}

// Foursquare API ile mahalle verilerini çekmek (alternatif yöntem)
async function fetchNeighborhoodsFromOpenData(cityName: string, districtName: string): Promise<string[]> {
  try {
    console.log(`🌐 Açık veri kaynakları ile mahalle sorgusu: ${cityName} - ${districtName}`);
    
    // Burada açık veri kaynaklarından veri çekme işlemi yapılabilir
    // Örnek olarak mahalle listesi döndürüyoruz
    // Gerçek uygulamada bir API'dan veri çekilmesi gerekir
    
    // Bazı iller için bazı örnek mahalleler oluşturalım
    const sampleNeighborhoods: { [key: string]: { [key: string]: string[] } } = {
      "İzmir": {
        "Urla": ["Zeytinalanı", "Rüstem", "İskele", "Çamlı", "Zeytinler", "Demircili", "Bademler"],
        "Çeşme": ["Alaçatı", "Dalyan", "Çiftlikköy", "Ilıca", "Reisdere", "Ovacık", "Şifne"],
        "Menemen": ["Asarlık", "Ulukent", "Seyrek", "Türkelli", "Villakent", "Emiralem", "Koyundere"]
      },
      "Antalya": {
        "Alanya": ["Oba", "Kestel", "Tosmur", "Mahmutlar", "Payallar", "Avsallar", "Konaklı", "Demirtaş"],
        "Manavgat": ["Çolaklı", "Evrenseki", "Side", "Kumköy", "Sarılar", "Taşağıl", "Gündoğdu"],
        "Serik": ["Belek", "Boğazkent", "Kadriye", "Çandır", "Yukarıkocayatak", "Gebiz", "Belkıs"]
      },
      "Muğla": {
        "Bodrum": ["Gümbet", "Bitez", "Ortakent", "Turgutreis", "Yalıkavak", "Gündoğan", "Gölköy", "Konacık"],
        "Marmaris": ["İçmeler", "Beldibi", "Armutalan", "Siteler", "Tepe", "Orhaniye", "Selimiye", "Turunç"],
        "Fethiye": ["Çalış", "Karagözler", "Foça", "Kayaköy", "Ölüdeniz", "Ovacık", "Hisarönü", "Göcek"]
      }
    };
    
    // Eğer örnek verilerimizde bu şehir ve ilçe varsa, onları döndürelim
    if (sampleNeighborhoods[cityName] && sampleNeighborhoods[cityName][districtName]) {
      return sampleNeighborhoods[cityName][districtName];
    }
    
    // Aksi halde boş bir dizi döndürelim
    return [];
  } catch (error) {
    console.error(`❌ Açık veri hatası: ${error}`);
    return [];
  }
}

// Google Maps API ile eksik mahalle verilerini çek
async function fetchNeighborhoodsFromGoogle(cityName: string, districtName: string): Promise<string[]> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('⚠️ GOOGLE_MAPS_API_KEY bulunamadı, bu kaynak atlanıyor');
      return [];
    }
    
    await sleep(API_DELAY);
    
    console.log(`🔍 Google Maps API mahalle sorgusu: ${cityName} - ${districtName}`);
    
    const query = `${districtName} mahalleleri ${cityName}`;
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    const response = await axios.get(url, {
      params: {
        query,
        key: GOOGLE_MAPS_API_KEY,
        language: 'tr',
        region: 'tr',
        type: 'neighborhood'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.results) {
      const neighborhoods = response.data.results
        .filter((result: any) => {
          return result.types && (
            result.types.includes('sublocality') || 
            result.types.includes('sublocality_level_1') ||
            result.types.includes('neighborhood') ||
            result.types.includes('political')
          );
        })
        .map((result: any) => {
          const name = result.name
            .replace(/\sMahallesi$/i, '')
            .replace(/\sMah\.?$/i, '')
            .replace(/\sMh\.?$/i, '')
            .replace(new RegExp(`^${districtName}\\s+`, 'i'), '') // İlçe adını baştan kaldır
            .replace(new RegExp(`\\s+${districtName}$`, 'i'), '') // İlçe adını sondan kaldır
            .trim();
          return name;
        })
        .filter((name: string) => 
          name && 
          name.trim() !== '' && 
          name.toLowerCase() !== districtName.toLowerCase()
        );
      
      console.log(`✅ Google Maps'ten ${neighborhoods.length} mahalle bulundu`);
      return Array.from(new Set(neighborhoods));
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

// OpenStreetMap Nominatim API ile mahalle verilerini çekmek
async function fetchNeighborhoodsFromOSM(cityName: string, districtName: string): Promise<string[]> {
  try {
    await sleep(OSM_DELAY); // OSM API rate limit politikası gereği bekleme
    
    console.log(`🔍 OpenStreetMap API mahalle sorgusu: ${cityName} - ${districtName}`);
    
    // İlk sorgu - mahalle araması
    const url = 'https://nominatim.openstreetmap.org/search';
    const response = await axios.get(url, {
      params: {
        q: `${districtName} mahalle ${cityName} Türkiye`,
        format: 'json',
        addressdetails: 1,
        limit: 50,
        countrycodes: 'tr',
        'accept-language': 'tr'
      },
      headers: {
        'User-Agent': 'GlobalEmlakAI/1.0' // OSM API kullanım politikası gereği User-Agent gerekli
      },
      timeout: 10000
    });
    
    if (response.data && Array.isArray(response.data)) {
      // Mahalleleri çıkar
      const neighborhoods = response.data
        .filter((item: any) => {
          // Mahalle olabilecek sonuçları filtrele
          return (
            item.type === 'administrative' || 
            item.type === 'suburb' || 
            item.type === 'neighbourhood' ||
            (item.address && (
              item.address.neighbourhood || 
              item.address.suburb || 
              item.address.quarter
            ))
          );
        })
        .map((item: any) => {
          // Mahalle adını çıkar
          let name = '';
          
          if (item.address) {
            name = item.address.neighbourhood || 
                  item.address.suburb || 
                  item.address.quarter || 
                  item.address.residential || 
                  '';
          }
          
          // Eğer address içinde mahalle bulunamadıysa display_name'den çıkarmayı dene
          if (!name && item.display_name) {
            const parts = item.display_name.split(',');
            if (parts.length > 0) {
              name = parts[0].trim();
            }
          }
          
          return name
            .replace(/\sMahallesi$/i, '')
            .replace(/\sMah\.?$/i, '')
            .replace(/\sMh\.?$/i, '')
            .trim();
        })
        .filter((name: string) => 
          name && 
          name.trim() !== '' && 
          name.toLowerCase() !== districtName.toLowerCase() &&
          name.length > 2 // Çok kısa isimleri filtrele
        );
      
      console.log(`✅ OpenStreetMap'ten ${neighborhoods.length} mahalle bulundu`);
      return Array.from(new Set(neighborhoods));
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

// Eksik ilçelerin mahalle verilerini tamamlamak için
async function fillMissingNeighborhoods(): Promise<void> {
  try {
    console.log('🔄 Eksik mahalleleri doldurma başlatılıyor...');
    
    // İl ve ilçe verilerini oku
    const districtsData = readDistrictsData();
    
    // Tüm mahalle verilerini oku
    const allNeighborhoodsData = readDataFromFile('tr_all_neighborhoods.json') || {};
    
    // Kaç ilçe ve mahalle verisi doldurulduğunu takip et
    let filledDistricts = 0;
    let filledNeighborhoods = 0;
    let failedDistricts = 0;
    
    // Öncelikli illeri belirle (turistik ve büyükşehirler)
    const priorityCities = [
      'Kayseri', 'Konya', 'Eskişehir', 'Kocaeli', 'Sakarya', 'Samsun', 'Gaziantep',
      'Şanlıurfa', 'Kahramanmaraş', 'Diyarbakır', 'Malatya', 'Denizli', 'Erzurum', 'Van'
    ];
    
    // Önce öncelikli illeri işle
    for (const cityName of priorityCities) {
      console.log(`🏙️ ${cityName} ili için ilçeleri işleme başlanıyor...`);
      
      // İl için mahalle verisi yoksa oluştur
      if (!allNeighborhoodsData[cityName]) {
        allNeighborhoodsData[cityName] = {};
      }
      
      // İlin ilçelerini al
      const districts = districtsData[cityName] || [];
      
      // İl için değişiklik yapılıp yapılmadığını takip et
      let cityModified = false;
      
      // Her ilçe için
      for (const district of districts) {
        try {
          // Eğer bu ilçenin mahalle verisi yoksa veya boşsa
          if (!allNeighborhoodsData[cityName][district] || allNeighborhoodsData[cityName][district].length === 0) {
            console.log(`  🔍 ${district} ilçesi için mahalle verileri aranıyor...`);
            
            let neighborhoods: string[] = [];
            
            // Önce Mapbox API'yi dene
            neighborhoods = await fetchNeighborhoodsFromMapbox(`${district}, ${cityName}, Türkiye`);
            
            // Eğer Mapbox'tan veri gelmezse, OpenStreetMap'i dene
            if (neighborhoods.length === 0) {
              neighborhoods = await fetchNeighborhoodsFromOSM(cityName, district);
            }
            
            // Eğer hala veri gelmezse, açık veri kaynaklarını dene
            if (neighborhoods.length === 0) {
              neighborhoods = await fetchNeighborhoodsFromOpenData(cityName, district);
            }
            
            // Eğer veri bulunmuşsa
            if (neighborhoods.length > 0) {
              allNeighborhoodsData[cityName][district] = neighborhoods;
              filledDistricts++;
              filledNeighborhoods += neighborhoods.length;
              cityModified = true;
              
              console.log(`  ✅ ${district} ilçesi için ${neighborhoods.length} mahalle bulundu.`);
              
              // Her başarılı ilçe sonrası verileri kaydet
              saveDataToFile('tr_all_neighborhoods.json', allNeighborhoodsData);
            } else {
              console.log(`  ⚠️ ${district} ilçesi için mahalle verisi bulunamadı.`);
              failedDistricts++;
            }
            
            // API sınırlamaları için bekle
            await sleep(API_DELAY);
          }
        } catch (error) {
          console.error(`  ❌ ${district} ilçesi işlenirken hata oluştu:`, error);
          failedDistricts++;
          continue;
        }
      }
      
      // Eğer il için değişiklik yapıldıysa, il bazlı dosyayı güncelle
      if (cityModified) {
        saveDataToFile(`tr_${cityName.toLowerCase()}_neighborhoods.json`, allNeighborhoodsData[cityName]);
      }
    }
    
    console.log(`
📊 İşlem Özeti:
✅ Başarıyla eklenen ilçe sayısı: ${filledDistricts}
📝 Toplam eklenen mahalle sayısı: ${filledNeighborhoods}
⚠️ Başarısız ilçe sayısı: ${failedDistricts}
    `);
  } catch (error) {
    console.error(`❌ Eksik mahalle doldurma hatası: ${error}`);
  }
}

// Ana fonksiyon
async function main(): Promise<void> {
  console.log('🚀 Türkiye için eksik mahalle verilerini tamamlama işlemi başlatılıyor...');
  
  // Veri klasörü yoksa oluştur
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Eksik mahalleleri doldur
  await fillMissingNeighborhoods();
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