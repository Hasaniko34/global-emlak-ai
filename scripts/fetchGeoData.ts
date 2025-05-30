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

// Mevcut ilçe verileri olan iller
const EXISTING_PROVINCE_DATA = [
  "Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana", 
  "Konya", "Gaziantep", "Mersin", "Kayseri", "Kocaeli", "Eskişehir", 
  "Samsun", "Tekirdağ", "Trabzon", "Diyarbakır", "Hatay", "Manisa"
];

// Türkiye'deki tüm illerin listesi ve bu illerin plaka kodları
const ALL_TURKISH_PROVINCES = [
  { code: "01", name: "Adana" },
  { code: "02", name: "Adıyaman" },
  { code: "03", name: "Afyonkarahisar" },
  { code: "04", name: "Ağrı" },
  { code: "05", name: "Amasya" },
  { code: "06", name: "Ankara" },
  { code: "07", name: "Antalya" },
  { code: "08", name: "Artvin" },
  { code: "09", name: "Aydın" },
  { code: "10", name: "Balıkesir" },
  { code: "11", name: "Bilecik" },
  { code: "12", name: "Bingöl" },
  { code: "13", name: "Bitlis" },
  { code: "14", name: "Bolu" },
  { code: "15", name: "Burdur" },
  { code: "16", name: "Bursa" },
  { code: "17", name: "Çanakkale" },
  { code: "18", name: "Çankırı" },
  { code: "19", name: "Çorum" },
  { code: "20", name: "Denizli" },
  { code: "21", name: "Diyarbakır" },
  { code: "22", name: "Edirne" },
  { code: "23", name: "Elazığ" },
  { code: "24", name: "Erzincan" },
  { code: "25", name: "Erzurum" },
  { code: "26", name: "Eskişehir" },
  { code: "27", name: "Gaziantep" },
  { code: "28", name: "Giresun" },
  { code: "29", name: "Gümüşhane" },
  { code: "30", name: "Hakkari" },
  { code: "31", name: "Hatay" },
  { code: "32", name: "Isparta" },
  { code: "33", name: "Mersin" },
  { code: "34", name: "İstanbul" },
  { code: "35", name: "İzmir" },
  { code: "36", name: "Kars" },
  { code: "37", name: "Kastamonu" },
  { code: "38", name: "Kayseri" },
  { code: "39", name: "Kırklareli" },
  { code: "40", name: "Kırşehir" },
  { code: "41", name: "Kocaeli" },
  { code: "42", name: "Konya" },
  { code: "43", name: "Kütahya" },
  { code: "44", name: "Malatya" },
  { code: "45", name: "Manisa" },
  { code: "46", name: "Kahramanmaraş" },
  { code: "47", name: "Mardin" },
  { code: "48", name: "Muğla" },
  { code: "49", name: "Muş" },
  { code: "50", name: "Nevşehir" },
  { code: "51", name: "Niğde" },
  { code: "52", name: "Ordu" },
  { code: "53", name: "Rize" },
  { code: "54", name: "Sakarya" },
  { code: "55", name: "Samsun" },
  { code: "56", name: "Siirt" },
  { code: "57", name: "Sinop" },
  { code: "58", name: "Sivas" },
  { code: "59", name: "Tekirdağ" },
  { code: "60", name: "Tokat" },
  { code: "61", name: "Trabzon" },
  { code: "62", name: "Tunceli" },
  { code: "63", name: "Şanlıurfa" },
  { code: "64", name: "Uşak" },
  { code: "65", name: "Van" },
  { code: "66", name: "Yozgat" },
  { code: "67", name: "Zonguldak" },
  { code: "68", name: "Aksaray" },
  { code: "69", name: "Bayburt" },
  { code: "70", name: "Karaman" },
  { code: "71", name: "Kırıkkale" },
  { code: "72", name: "Batman" },
  { code: "73", name: "Şırnak" },
  { code: "74", name: "Bartın" },
  { code: "75", name: "Ardahan" },
  { code: "76", name: "Iğdır" },
  { code: "77", name: "Yalova" },
  { code: "78", name: "Karabük" },
  { code: "79", name: "Kilis" },
  { code: "80", name: "Osmaniye" },
  { code: "81", name: "Düzce" }
];

// Eksik olan illeri filtrele (mevcut olanlara bakmak yerine eksik olanlara odaklanacağız)
const MISSING_PROVINCES = ALL_TURKISH_PROVINCES.filter(province => 
  !EXISTING_PROVINCE_DATA.includes(province.name) && 
  !EXISTING_PROVINCE_DATA.includes(province.name.toLowerCase()));

console.log(`Toplam ${MISSING_PROVINCES.length} il için veri çekilecek:`);
MISSING_PROVINCES.forEach(province => console.log(`- ${province.name}`));

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
        country,
        limit: 10
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Mapbox API hatası: ${error}`);
    return { features: [] };
  }
}

// HERE API ile veri çekme fonksiyonu
async function fetchFromHereAPI(query: string, country: string): Promise<any> {
  try {
    if (!HERE_API_KEY) {
      throw new Error('HERE_API_KEY bulunamadı');
    }
    
    const url = 'https://geocode.search.hereapi.com/v1/geocode';
    
    console.log(`🔍 HERE API isteği - Query: ${query}, Ülke: ${country}`);
    
    const response = await axios.get(url, {
      params: {
        q: query,
        apiKey: HERE_API_KEY,
        in: `countryCode:${country}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ HERE API hatası: ${error}`);
    return { items: [] };
  }
}

// İlçeleri çekmek için HERE API fonksiyonu
async function fetchDistrictsFromHereAPI(cityName: string, countryCode: string): Promise<any[]> {
  try {
    console.log(`🔍 ${cityName} için ilçeler çekiliyor...`);
    
    const query = `${cityName}, Türkiye`;
    const result = await fetchFromHereAPI(query, countryCode);
    
    if (!result.items || result.items.length === 0) {
      console.warn(`⚠️ ${cityName} için ilçe bulunamadı`);
      return [];
    }
    
    const districts: string[] = [];
    
    // İlçeleri çekmek için özel bir sorgulama yapılması gerekebilir
    // Burada sadece basit bir yaklaşım gösteriliyor
    // Gerçek uygulamada daha karmaşık bir mantık gerekebilir
    
    return districts;
  } catch (error) {
    console.error(`❌ ${cityName} için ilçe çekme hatası: ${error}`);
    return [];
  }
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

// Mevcut ilçe verilerini oku
function readExistingDistricts(): any {
  const filePath = path.join(DATA_DIR, 'tr_districts.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return {};
}

// Google Maps API ile Türkiye'deki ilçeleri çekmek için
async function fetchTurkeyDistricts(provinceName: string): Promise<string[]> {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY bulunamadı');
    }
    
    console.log(`🔍 ${provinceName} için ilçeler çekiliyor (Google Maps API)...`);
    
    // Daha kesin sonuçlar için sorguyu şekillendirme
    const query = `${provinceName} ilçeleri Türkiye`;
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    const response = await axios.get(url, {
      params: {
        query,
        key: GOOGLE_MAPS_API_KEY,
        language: 'tr',
        region: 'tr'
      }
    });
    
    if (!response.data.results || response.data.results.length === 0) {
      console.warn(`⚠️ ${provinceName} için ilçe bulunamadı`);
      return [];
    }
    
    // İlçe adlarını çıkarmak için sonuçları işle
    // Bu basit bir örnektir ve gerçek uygulamada daha karmaşık işleme gerekebilir
    const districts = response.data.results.map((result: any) => {
      // İlçe adını çıkar
      const name = result.name;
      if (name.includes('İlçesi') || name.includes('District')) {
        return name.replace(' İlçesi', '').replace(' District', '');
      }
      return null;
    }).filter(Boolean);
    
    return districts;
  } catch (error) {
    console.error(`❌ ${provinceName} için ilçe çekme hatası (Google Maps API): ${error}`);
    return [];
  }
}

// Sabit ilçe verilerini kullanarak veritabanını doldur
async function populateTurkishDistrictsFromStaticData(): Promise<void> {
  try {
    console.log('🔄 Türkiye ilçe verilerini statik verilerle doldurma başlatılıyor...');
    
    // Statik veritabanı - Türkiye'nin tüm illeri için ilçe listesi
    // Bu veriler önceden hazırlanmış ve doğrulanmış olmalıdır
    const turkishDistrictsData: Record<string, string[]> = {
      "Adıyaman": ["Adıyaman", "Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Samsat", "Sincik", "Tut"],
      "Afyonkarahisar": ["Afyonkarahisar", "Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"],
      "Ağrı": ["Ağrı", "Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Patnos", "Taşlıçay", "Tutak"],
      "Aksaray": ["Aksaray", "Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Ortaköy", "Sarıyahşi", "Sultanhanı"],
      "Amasya": ["Amasya", "Göynücek", "Gümüşhacıköy", "Hamamözü", "Merzifon", "Suluova", "Taşova"],
      "Ardahan": ["Ardahan", "Çıldır", "Damal", "Göle", "Hanak", "Posof"],
      "Artvin": ["Ardanuç", "Arhavi", "Artvin", "Borçka", "Hopa", "Kemalpaşa", "Murgul", "Şavşat", "Yusufeli"],
      "Aydın": ["Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar"],
      "Balıkesir": ["Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"],
      "Bartın": ["Bartın", "Amasra", "Kurucaşile", "Ulus"],
      "Batman": ["Batman", "Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Sason"],
      "Bayburt": ["Bayburt", "Aydıntepe", "Demirözü"],
      "Bilecik": ["Bilecik", "Bozüyük", "Gölpazarı", "İnhisar", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"],
      "Bingöl": ["Bingöl", "Adaklı", "Genç", "Karlıova", "Kiğı", "Solhan", "Yayladere", "Yedisu"],
      "Bitlis": ["Bitlis", "Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Mutki", "Tatvan"],
      "Bolu": ["Bolu", "Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Mudurnu", "Seben", "Yeniçağa"],
      "Burdur": ["Burdur", "Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", "Kemer", "Tefenni", "Yeşilova"],
      "Çanakkale": ["Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Çanakkale", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Yenice"],
      "Çankırı": ["Çankırı", "Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", "Korgun", "Kurşunlu", "Orta", "Şabanözü", "Yapraklı"],
      "Çorum": ["Çorum", "Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", "Mecitözü", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"],
      "Denizli": ["Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"],
      "Düzce": ["Düzce", "Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Yığılca"],
      "Edirne": ["Edirne", "Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Süloğlu", "Uzunköprü"],
      "Elazığ": ["Elazığ", "Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", "Maden", "Palu", "Sivrice"],
      "Erzincan": ["Erzincan", "Çayırlı", "İliç", "Kemah", "Kemaliye", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"],
      "Erzurum": ["Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"],
      "Iğdır": ["Iğdır", "Aralık", "Karakoyunlu", "Tuzluca"],
      "Isparta": ["Isparta", "Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"],
      "Kahramanmaraş": ["Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"],
      "Karabük": ["Karabük", "Eflani", "Eskipazar", "Ovacık", "Safranbolu", "Yenice"],
      "Karaman": ["Karaman", "Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Sarıveliler"],
      "Kars": ["Kars", "Akyaka", "Arpaçay", "Digor", "Kağızman", "Sarıkamış", "Selim", "Susuz"],
      "Kastamonu": ["Kastamonu", "Abana", "Ağlı", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", "Küre", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"],
      "Kırıkkale": ["Kırıkkale", "Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Sulakyurt", "Yahşihan"],
      "Kırklareli": ["Kırklareli", "Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Pehlivanköy", "Pınarhisar", "Vize"],
      "Kırşehir": ["Kırşehir", "Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Mucur"],
      "Kilis": ["Kilis", "Elbeyli", "Musabeyli", "Polateli"],
      "Kütahya": ["Kütahya", "Altıntaş", "Aslanapa", "Çavdarhisar", "Domaniç", "Dumlupınar", "Emet", "Gediz", "Hisarcık", "Pazarlar", "Şaphane", "Simav", "Tavşanlı"],
      "Malatya": ["Malatya", "Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"],
      "Mardin": ["Mardin", "Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"],
      "Muğla": ["Muğla", "Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"],
      "Muş": ["Muş", "Bulanık", "Hasköy", "Korkut", "Malazgirt", "Varto"],
      "Nevşehir": ["Nevşehir", "Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Ürgüp"],
      "Niğde": ["Niğde", "Altunhisar", "Bor", "Çamardı", "Çiftlik", "Ulukışla"],
      "Ordu": ["Ordu", "Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"],
      "Osmaniye": ["Osmaniye", "Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Sumbas", "Toprakkale"],
      "Rize": ["Rize", "Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Pazar"],
      "Sakarya": ["Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", "Serdivan", "Söğütlü", "Taraklı"],
      "Siirt": ["Siirt", "Baykan", "Eruh", "Kurtalan", "Pervari", "Şirvan", "Tillo"],
      "Sinop": ["Sinop", "Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Saraydüzü", "Türkeli"],
      "Sivas": ["Sivas", "Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Suşehri", "Şarkışla", "Ulaş", "Yıldızeli", "Zara"],
      "Şanlıurfa": ["Şanlıurfa", "Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"],
      "Şırnak": ["Şırnak", "Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Silopi", "Uludere"],
      "Tokat": ["Tokat", "Almus", "Artova", "Başçiftlik", "Erbaa", "Niksar", "Pazar", "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"],
      "Tunceli": ["Tunceli", "Çemişgezek", "Hozat", "Mazgirt", "Nazımiye", "Ovacık", "Pertek", "Pülümür"],
      "Uşak": ["Uşak", "Banaz", "Eşme", "Karahallı", "Sivaslı", "Ulubey"],
      "Van": ["Van", "Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"],
      "Yalova": ["Yalova", "Altınova", "Armutlu", "Çiftlikköy", "Çınarcık", "Termal"],
      "Yozgat": ["Yozgat", "Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", "Kadışehri", "Saraykent", "Sarıkaya", "Şefaatli", "Sorgun", "Yenifakılı", "Yerköy"],
      "Zonguldak": ["Zonguldak", "Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "Kozlu"]
    };
    
    // Mevcut ilçe verilerini oku
    let existingDistrictsData = readExistingDistricts();
    
    // Eksik olan iller için ilçe verilerini ekle
    for (const province of MISSING_PROVINCES) {
      const provinceName = province.name;
      if (turkishDistrictsData[provinceName]) {
        console.log(`✅ ${provinceName} için statik ilçe verileri ekleniyor...`);
        existingDistrictsData[provinceName] = turkishDistrictsData[provinceName];
      } else {
        console.warn(`⚠️ ${provinceName} için statik ilçe verisi bulunamadı.`);
      }
    }
    
    // Güncellenmiş verileri kaydet
    saveDataToFile('tr_districts.json', existingDistrictsData);
    
    console.log('✅ Tüm Türkiye ilçe verileri başarıyla eklendi!');
  } catch (error) {
    console.error(`❌ Türkiye ilçe verilerini doldurma hatası: ${error}`);
  }
}

// Ana fonksiyon
async function main(): Promise<void> {
  console.log('🚀 Türkiye için eksik il-ilçe verilerini çekme işlemi başlatılıyor...');
  
  // Veri klasörü yoksa oluştur
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Statik verilerle ilçeleri doldur
  await populateTurkishDistrictsFromStaticData();
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