/**
 * Dünya ülkeleri ve şehirleri listesi
 */

export const COUNTRIES = [
  {
    code: 'TR',
    name: 'Türkiye',
    cities: [
      {
        name: 'İstanbul',
        districts: ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu']
      },
      {
        name: 'Ankara',
        districts: ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kahramankazan', 'Kalecik', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle']
      },
      {
        name: 'İzmir',
        districts: ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla']
      },
      {
        name: 'Antalya',
        districts: ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik']
      },
      {
        name: 'Bursa',
        districts: ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım']
      },
      {
        name: 'Adana',
        districts: ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir']
      },
      {
        name: 'Konya',
        districts: ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Çeltik', 'Cihanbeyli', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak']
      },
      {
        name: 'Eskişehir',
        districts: ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı']
      },
      {
        name: 'Trabzon',
        districts: ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Şalpazarı', 'Sürmene', 'Tonya', 'Vakfıkebir', 'Yomra']
      },
      {
        name: 'Gaziantep',
        districts: ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli']
      },
      {
        name: 'Muğla',
        districts: ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan']
      },
      {
        name: 'Kayseri',
        districts: ['Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan', 'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı', 'Yeşilhisar']
      }
    ]
  },
  {
    code: 'US',
    name: 'Amerika Birleşik Devletleri',
    cities: [
      {
        name: 'New York',
        districts: ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island']
      },
      {
        name: 'Los Angeles',
        districts: ['Downtown', 'Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice', 'Pasadena']
      },
      {
        name: 'Chicago',
        districts: ['Loop', 'West Loop', 'Lincoln Park', 'Wicker Park', 'River North', 'Gold Coast']
      },
      {
        name: 'Miami',
        districts: ['Downtown', 'Miami Beach', 'Coral Gables', 'Coconut Grove', 'Brickell', 'Little Havana']
      },
      {
        name: 'San Francisco',
        districts: ['Downtown', 'Fisherman\'s Wharf', 'Mission District', 'SoMa', 'Chinatown', 'Nob Hill']
      }
    ]
  },
  {
    code: 'GB',
    name: 'Birleşik Krallık',
    cities: [
      {
        name: 'Londra',
        districts: ['Westminster', 'Camden', 'Greenwich', 'Kensington and Chelsea', 'Hackney', 'Islington']
      },
      {
        name: 'Manchester',
        districts: ['City Centre', 'Salford', 'Trafford', 'Stockport', 'Tameside', 'Bolton']
      },
      {
        name: 'Birmingham',
        districts: ['City Centre', 'Edgbaston', 'Erdington', 'Harborne', 'Selly Oak', 'Sutton Coldfield']
      },
      {
        name: 'Edinburgh',
        districts: ['Old Town', 'New Town', 'Leith', 'Stockbridge', 'Morningside', 'Portobello']
      },
      {
        name: 'Liverpool',
        districts: ['City Centre', 'Anfield', 'Everton', 'Allerton', 'Childwall', 'Aigburth']
      }
    ]
  },
  {
    code: 'DE',
    name: 'Almanya',
    cities: [
      {
        name: 'Berlin',
        districts: ['Mitte', 'Kreuzberg', 'Charlottenburg', 'Neukölln', 'Prenzlauer Berg', 'Schöneberg']
      },
      {
        name: 'Münih',
        districts: ['Altstadt', 'Schwabing', 'Maxvorstadt', 'Haidhausen', 'Bogenhausen', 'Neuhausen']
      },
      {
        name: 'Hamburg',
        districts: ['Altstadt', 'St. Pauli', 'Eimsbüttel', 'Altona', 'Harburg', 'Bergedorf']
      },
      {
        name: 'Frankfurt',
        districts: ['Altstadt', 'Bahnhofsviertel', 'Bornheim', 'Sachsenhausen', 'Westend', 'Nordend']
      },
      {
        name: 'Köln',
        districts: ['Altstadt', 'Ehrenfeld', 'Nippes', 'Lindenthal', 'Porz', 'Chorweiler']
      }
    ]
  },
  {
    code: 'FR',
    name: 'Fransa',
    cities: [
      {
        name: 'Paris',
        districts: ['1er Arrondissement', '2e Arrondissement', 'Montmartre', 'Le Marais', 'Saint-Germain-des-Prés', 'Louvre']
      },
      {
        name: 'Marsilya',
        districts: ['Vieux-Port', 'Le Panier', 'Notre-Dame de la Garde', 'Vauban', 'Endoume', 'La Plaine']
      },
      {
        name: 'Lyon',
        districts: ['Presqu\'île', 'Vieux Lyon', 'Croix-Rousse', 'Fourvière', 'Brotteaux', 'Guillotière']
      },
      {
        name: 'Nice',
        districts: ['Vieux Nice', 'Cimiez', 'Gambetta', 'Port', 'Riquier', 'Carabacel']
      },
      {
        name: 'Bordeaux',
        districts: ['Centre Ville', 'Chartrons', 'Saint-Michel', 'Saint-Pierre', 'Bastide', 'Bacalan']
      }
    ]
  },
  {
    code: 'ES',
    name: 'İspanya',
    cities: [
      {
        name: 'Madrid',
        districts: ['Centro', 'Salamanca', 'Chamberí', 'Retiro', 'Arganzuela', 'Chamartín']
      },
      {
        name: 'Barselona',
        districts: ['Ciutat Vella', 'Eixample', 'Gràcia', 'Sant Martí', 'Sants-Montjuïc', 'Les Corts']
      },
      {
        name: 'Valensiya',
        districts: ['Ciutat Vella', 'Eixample', 'Extramurs', 'Campanar', 'La Saïdia', 'El Pla del Real']
      },
      {
        name: 'Sevilla',
        districts: ['Casco Antiguo', 'Triana', 'Nervión', 'Macarena', 'Los Remedios', 'Bellavista-La Palmera']
      },
      {
        name: 'Malaga',
        districts: ['Centro', 'El Palo', 'Carretera de Cádiz', 'Ciudad Jardín', 'Campanillas', 'Churriana']
      }
    ]
  },
  {
    code: 'IT',
    name: 'İtalya',
    cities: [
      {
        name: 'Roma',
        districts: ['Centro Storico', 'Trastevere', 'Testaccio', 'Prati', 'Monti', 'Esquilino']
      },
      {
        name: 'Milano',
        districts: ['Centro Storico', 'Navigli', 'Brera', 'Porta Nuova', 'Isola', 'Porta Romana']
      },
      {
        name: 'Napoli',
        districts: ['Centro Storico', 'Chiaia', 'Vomero', 'Posillipo', 'Fuorigrotta', 'Bagnoli']
      },
      {
        name: 'Floransa',
        districts: ['Centro Storico', 'Santa Croce', 'Santo Spirito', 'San Niccolò', 'Campo di Marte', 'Isolotto']
      },
      {
        name: 'Venedik',
        districts: ['San Marco', 'Cannaregio', 'Castello', 'San Polo', 'Santa Croce', 'Dorsoduro']
      }
    ]
  },
  {
    code: 'AE',
    name: 'Birleşik Arap Emirlikleri',
    cities: [
      {
        name: 'Dubai',
        districts: ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Deira', 'Business Bay', 'Jumeirah']
      },
      {
        name: 'Abu Dabi',
        districts: ['Downtown', 'Al Reem Island', 'Al Raha Beach', 'Yas Island', 'Saadiyat Island', 'Khalifa City']
      },
      {
        name: 'Sharjah',
        districts: ['Al Majaz', 'Al Nahda', 'Al Khan', 'Al Qasimia', 'Al Taawun', 'Muwailih Commercial']
      },
      {
        name: 'Ajman',
        districts: ['Ajman Downtown', 'Al Nuaimiya', 'Al Jurf', 'Emirates City', 'Garden City', 'Al Rashidiya']
      },
      {
        name: 'Ras Al Khaimah',
        districts: ['Al Hamra', 'Al Nakheel', 'Al Mairid', 'Al Dhait', 'Al Rams', 'Khuzam']
      }
    ]
  },
  {
    code: 'CA',
    name: 'Kanada',
    cities: [
      {
        name: 'Toronto',
        districts: ['Downtown', 'North York', 'Scarborough', 'Etobicoke', 'East York', 'York']
      },
      {
        name: 'Montreal',
        districts: ['Ville-Marie', 'Le Plateau-Mont-Royal', 'Rosemont', 'Westmount', 'Outremont', 'Verdun']
      },
      {
        name: 'Vancouver',
        districts: ['Downtown', 'West End', 'Kitsilano', 'Gastown', 'Yaletown', 'Mount Pleasant']
      },
      {
        name: 'Calgary',
        districts: ['Downtown', 'Beltline', 'Inglewood', 'Kensington', 'Mission', 'Bridgeland']
      },
      {
        name: 'Ottawa',
        districts: ['Downtown', 'ByWard Market', 'Westboro', 'Glebe', 'Sandy Hill', 'Centretown']
      }
    ]
  },
  {
    code: 'JP',
    name: 'Japonya',
    cities: [
      {
        name: 'Tokyo',
        districts: ['Shinjuku', 'Shibuya', 'Minato', 'Chiyoda', 'Meguro', 'Setagaya']
      },
      {
        name: 'Osaka',
        districts: ['Kita', 'Minami', 'Chuo', 'Tennoji', 'Naniwa', 'Yodogawa']
      },
      {
        name: 'Kyoto',
        districts: ['Higashiyama', 'Shimogyo', 'Kamigyo', 'Nakagyo', 'Ukyo', 'Fushimi']
      },
      {
        name: 'Yokohama',
        districts: ['Nishi', 'Minami', 'Hodogaya', 'Kanagawa', 'Naka', 'Tsurumi']
      },
      {
        name: 'Nagoya',
        districts: ['Naka', 'Higashi', 'Kita', 'Showa', 'Mizuho', 'Atsuta']
      }
    ]
  },
  {
    code: 'AU',
    name: 'Avustralya',
    cities: [
      {
        name: 'Sydney',
        districts: ['CBD', 'Bondi', 'Manly', 'Parramatta', 'Surry Hills', 'Newtown']
      },
      {
        name: 'Melbourne',
        districts: ['CBD', 'St Kilda', 'Carlton', 'Fitzroy', 'South Yarra', 'Brunswick']
      },
      {
        name: 'Brisbane',
        districts: ['CBD', 'Fortitude Valley', 'South Bank', 'New Farm', 'West End', 'Paddington']
      },
      {
        name: 'Perth',
        districts: ['CBD', 'Fremantle', 'Subiaco', 'Cottesloe', 'South Perth', 'Northbridge']
      },
      {
        name: 'Adelaide',
        districts: ['CBD', 'North Adelaide', 'Glenelg', 'Norwood', 'Burnside', 'Prospect']
      }
    ]
  },
  {
    code: 'KR',
    name: 'Güney Kore',
    cities: [
      {
        name: 'Seul',
        districts: ['Gangnam', 'Hongdae', 'Itaewon', 'Myeongdong', 'Jongno', 'Yeouido']
      },
      {
        name: 'Busan',
        districts: ['Haeundae', 'Nampo', 'Seomyeon', 'Gwangalli', 'Gijang', 'Sasang']
      },
      {
        name: 'Incheon',
        districts: ['Jung-gu', 'Namdong', 'Bupyeong', 'Yeonsu', 'Seo-gu', 'Dong-gu']
      },
      {
        name: 'Daegu',
        districts: ['Jung-gu', 'Dong-gu', 'Seo-gu', 'Nam-gu', 'Buk-gu', 'Suseong']
      },
      {
        name: 'Daejeon',
        districts: ['Yuseong', 'Seo-gu', 'Jung-gu', 'Dong-gu', 'Daedeok', 'Daejeon']
      }
    ]
  }
];

/**
 * Ülke koduna göre ülke bilgilerini alır
 * @param {string} countryCode - Ülke kodu (TR, US, vb.)
 * @returns {object|null} - Ülke bilgileri
 */
export function getCountryByCode(countryCode) {
  return COUNTRIES.find(country => country.code === countryCode) || null;
}

/**
 * Ülke koduna göre şehirleri alır
 * @param {string} countryCode - Ülke kodu
 * @returns {array} - Şehir listesi
 */
export function getCitiesByCountry(countryCode) {
  const country = getCountryByCode(countryCode);
  return country ? country.cities.map(city => city.name) : [];
}

/**
 * Ülke ve şehir adına göre ilçeleri alır
 * @param {string} countryCode - Ülke kodu
 * @param {string} cityName - Şehir adı
 * @returns {array} - İlçe listesi
 */
export function getDistrictsByCity(countryCode, cityName) {
  const country = getCountryByCode(countryCode);
  if (!country || !country.cities) return [];
  
  const city = country.cities.find(c => c.name === cityName);
  if (!city) return [];
  
  return city.districts;
}

/**
 * Tüm ülkelerin isimlerini ve kodlarını alır
 * @returns {array} - Ülke isimleri ve kodları içeren dizi
 */
export function getAllCountries() {
  return COUNTRIES.map(country => ({
    code: country.code,
    name: country.name
  }));
} 