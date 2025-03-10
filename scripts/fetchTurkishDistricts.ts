import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

// Veri klasörü
const DATA_DIR = path.join(process.cwd(), 'data');

// Mevcut ilçe verileri olan iller
const EXISTING_PROVINCE_DATA = [
  "Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana", 
  "Konya", "Gaziantep", "Mersin", "Kayseri", "Kocaeli", "Eskişehir", 
  "Samsun", "Tekirdağ", "Trabzon", "Diyarbakır", "Hatay", "Manisa"
];

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
      "Giresun": ["Giresun", "Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", "Eynesil", "Görele", "Güce", "Keşap", "Piraziz", "Şebinkarahisar", "Tirebolu", "Yağlıdere"],
      "Gümüşhane": ["Gümüşhane", "Kelkit", "Köse", "Kürtün", "Şiran", "Torul"],
      "Hakkari": ["Hakkari", "Çukurca", "Derecik", "Şemdinli", "Yüksekova"],
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
    
    // İsimleri doğru formata getir (İstanbul olacak, Istanbul değil)
    if (existingDistrictsData["Istanbul"]) {
      existingDistrictsData["İstanbul"] = existingDistrictsData["Istanbul"];
      delete existingDistrictsData["Istanbul"];
    }
    
    if (existingDistrictsData["Izmir"]) {
      existingDistrictsData["İzmir"] = existingDistrictsData["Izmir"];
      delete existingDistrictsData["Izmir"];
    }
    
    // Tüm iller için ilçe verilerini ekle veya güncelle
    for (const provinceName in turkishDistrictsData) {
      if (!existingDistrictsData[provinceName]) {
        console.log(`✅ ${provinceName} için ilçe verileri ekleniyor...`);
        existingDistrictsData[provinceName] = turkishDistrictsData[provinceName];
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