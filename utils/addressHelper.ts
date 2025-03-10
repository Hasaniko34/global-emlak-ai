// countries-states-cities kütüphanesini kullanarak adres yardımcı fonksiyonları

import { Country, State, City } from 'country-state-city';
import { ICountry, IState, ICity } from 'country-state-city/lib/interface';
import { getNeighborhoodsByDistrict as getNeighborhoodsFromAPI, getStreetsByNeighborhood as getStreetsFromAPI, getCitiesByCountryHere, getDistrictsByCity as getDistrictsFromAPI } from '@/lib/geoServices';
import { AddressComponent } from '@/types/address';

// Interface tanımlamaları
interface SelectOption {
  value: string;
  label: string;
}

interface CountryOption extends SelectOption {
  nativeName: string;
}

interface StateOption extends SelectOption {
  countryCode: string;
}

interface CityOption extends SelectOption {
  stateCode: string;
  countryCode: string;
}

// MapBox API tipleri
interface MapboxContext {
  id: string;
  text: string;
  wikidata?: string;
  short_code?: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  place_type: string[];
  text: string;
  center: [number, number];
  context?: MapboxContext[];
}

interface MapboxResponse {
  type: string;
  features: MapboxFeature[];
}

// Type tanımları
type Country = {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  subregion: string;
  timezones: any[];
  translations: Record<string, string>;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
};

type State = {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  state_code: string;
  type: string;
  latitude: string;
  longitude: string;
};

type City = {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: string;
  longitude: string;
  wikiDataId: string;
};

// CityData interfacesini AddressComponent'e uygun olarak güncelliyorum
interface CityData {
  value: string;
  label: string;
  type: string;
  stateCode?: string;
  countryCode?: string;
}

// Ülke listesi
export const getAllCountries = (): CountryOption[] => {
  return Country.getAllCountries().map((country: ICountry) => ({
    value: country.isoCode,
    label: country.name,
    nativeName: country.name
  }));
};

// Sadece 6 kategorideki ülkeleri döndür (Amerika, Avrupa Ülkeleri, Türkiye, Kanada, Arap Körfez Ülkeleri ve Avustralya)
export const getAllowedCountries = (): CountryOption[] => {
  // Sadece izin verilen ülke kodlarını manuel olarak tanımlıyoruz (COUNTRIES array'indeki ülkeler)
  const allowedCountryCodes = COUNTRIES.map(country => country.value);
  
  // Tüm ülkelerden sadece izin verilenleri filtreliyoruz
  return Country.getAllCountries()
    .filter((country: ICountry) => allowedCountryCodes.includes(country.isoCode))
    .map((country: ICountry) => ({
      value: country.isoCode,
      label: country.name,
      nativeName: country.name
    }));
};

// Ülke koduna göre ülke bilgisini getir
export const getCountryByCode = (countryCode: string): any => {
  try {
    return Country.getCountryByCode(countryCode);
  } catch (error) {
    console.error(`Ülke bilgisi alınırken hata (${countryCode}):`, error);
    return null;
  }
};

// İl listesi - Amerika için tüm eyaletleri göster, diğer ülkeler için API'den al
export const getStatesByCountry = (countryCode: string): StateOption[] => {
  // Amerika için manuel eyalet listesi ekle
  if (countryCode === 'US') {
    return [
      { value: 'AL', label: 'Alabama', countryCode: 'US' },
      { value: 'AK', label: 'Alaska', countryCode: 'US' },
      { value: 'AZ', label: 'Arizona', countryCode: 'US' },
      { value: 'AR', label: 'Arkansas', countryCode: 'US' },
      { value: 'CA', label: 'California', countryCode: 'US' },
      { value: 'CO', label: 'Colorado', countryCode: 'US' },
      { value: 'CT', label: 'Connecticut', countryCode: 'US' },
      { value: 'DE', label: 'Delaware', countryCode: 'US' },
      { value: 'FL', label: 'Florida', countryCode: 'US' },
      { value: 'GA', label: 'Georgia', countryCode: 'US' },
      { value: 'HI', label: 'Hawaii', countryCode: 'US' },
      { value: 'ID', label: 'Idaho', countryCode: 'US' },
      { value: 'IL', label: 'Illinois', countryCode: 'US' },
      { value: 'IN', label: 'Indiana', countryCode: 'US' },
      { value: 'IA', label: 'Iowa', countryCode: 'US' },
      { value: 'KS', label: 'Kansas', countryCode: 'US' },
      { value: 'KY', label: 'Kentucky', countryCode: 'US' },
      { value: 'LA', label: 'Louisiana', countryCode: 'US' },
      { value: 'ME', label: 'Maine', countryCode: 'US' },
      { value: 'MD', label: 'Maryland', countryCode: 'US' },
      { value: 'MA', label: 'Massachusetts', countryCode: 'US' },
      { value: 'MI', label: 'Michigan', countryCode: 'US' },
      { value: 'MN', label: 'Minnesota', countryCode: 'US' },
      { value: 'MS', label: 'Mississippi', countryCode: 'US' },
      { value: 'MO', label: 'Missouri', countryCode: 'US' },
      { value: 'MT', label: 'Montana', countryCode: 'US' },
      { value: 'NE', label: 'Nebraska', countryCode: 'US' },
      { value: 'NV', label: 'Nevada', countryCode: 'US' },
      { value: 'NH', label: 'New Hampshire', countryCode: 'US' },
      { value: 'NJ', label: 'New Jersey', countryCode: 'US' },
      { value: 'NM', label: 'New Mexico', countryCode: 'US' },
      { value: 'NY', label: 'New York', countryCode: 'US' },
      { value: 'NC', label: 'North Carolina', countryCode: 'US' },
      { value: 'ND', label: 'North Dakota', countryCode: 'US' },
      { value: 'OH', label: 'Ohio', countryCode: 'US' },
      { value: 'OK', label: 'Oklahoma', countryCode: 'US' },
      { value: 'OR', label: 'Oregon', countryCode: 'US' },
      { value: 'PA', label: 'Pennsylvania', countryCode: 'US' },
      { value: 'RI', label: 'Rhode Island', countryCode: 'US' },
      { value: 'SC', label: 'South Carolina', countryCode: 'US' },
      { value: 'SD', label: 'South Dakota', countryCode: 'US' },
      { value: 'TN', label: 'Tennessee', countryCode: 'US' },
      { value: 'TX', label: 'Texas', countryCode: 'US' },
      { value: 'UT', label: 'Utah', countryCode: 'US' },
      { value: 'VT', label: 'Vermont', countryCode: 'US' },
      { value: 'VA', label: 'Virginia', countryCode: 'US' },
      { value: 'WA', label: 'Washington', countryCode: 'US' },
      { value: 'WV', label: 'West Virginia', countryCode: 'US' },
      { value: 'WI', label: 'Wisconsin', countryCode: 'US' },
      { value: 'WY', label: 'Wyoming', countryCode: 'US' },
      { value: 'DC', label: 'District of Columbia', countryCode: 'US' },
    ];
  }
  
  // Diğer ülkeler için country-state-city kütüphanesini kullan
  return State.getStatesOfCountry(countryCode).map((state: IState) => ({
    value: state.isoCode,
    label: state.name,
    countryCode: state.countryCode
  }));
};

// İlçe listesi - özel Amerika desteği ekle
export const getCitiesByState = (countryCode: string, stateCode: string): CityOption[] => {
  // Amerika için özel şehir listesi
  if (countryCode === 'US') {
    return getCitiesForUSState(stateCode);
  }
  
  // Diğer ülkeler için country-state-city kütüphanesini kullan
  return City.getCitiesOfState(countryCode, stateCode).map((city: ICity) => ({
    value: city.name,
    label: city.name,
    stateCode: city.stateCode || '',
    countryCode: city.countryCode
  }));
};

export const COUNTRIES: AddressComponent[] = [
  // Amerika
  { label: 'ABD', value: 'US', type: 'country' },
  
  // Avrupa Ülkeleri
  { label: 'Almanya', value: 'DE', type: 'country' },
  { label: 'Fransa', value: 'FR', type: 'country' },
  { label: 'Birleşik Krallık', value: 'GB', type: 'country' },
  { label: 'İtalya', value: 'IT', type: 'country' },
  { label: 'İspanya', value: 'ES', type: 'country' },
  { label: 'Hollanda', value: 'NL', type: 'country' },
  { label: 'İsviçre', value: 'CH', type: 'country' },
  { label: 'Polonya', value: 'PL', type: 'country' },
  { label: 'İsveç', value: 'SE', type: 'country' },
  { label: 'Belçika', value: 'BE', type: 'country' },
  { label: 'Avusturya', value: 'AT', type: 'country' },
  { label: 'Danimarka', value: 'DK', type: 'country' },
  { label: 'Finlandiya', value: 'FI', type: 'country' },
  { label: 'Norveç', value: 'NO', type: 'country' },
  { label: 'Portekiz', value: 'PT', type: 'country' },
  { label: 'İrlanda', value: 'IE', type: 'country' },
  { label: 'Yunanistan', value: 'GR', type: 'country' },
  
  // Türkiye
  { label: 'Türkiye', value: 'TR', type: 'country' },
  
  // Kanada
  { label: 'Kanada', value: 'CA', type: 'country' },
  
  // Arap Körfez Ülkeleri
  { label: 'Suudi Arabistan', value: 'SA', type: 'country' },
  { label: 'Birleşik Arap Emirlikleri', value: 'AE', type: 'country' },
  { label: 'Katar', value: 'QA', type: 'country' },
  { label: 'Kuveyt', value: 'KW', type: 'country' },
  { label: 'Bahreyn', value: 'BH', type: 'country' },
  { label: 'Umman', value: 'OM', type: 'country' },
  
  // Avustralya
  { label: 'Avustralya', value: 'AU', type: 'country' },
];

// Şehir listesini Here API'den çekmeyi dene, başarısız olursa statik verileri kullan
export const getCitiesByCountry = async (countryCode: string): Promise<AddressComponent[]> => {
  try {
    // Here API'den şehirleri çek
    const apiCities = await getCitiesByCountryHere(countryCode);
    
    // API'den veri geldiyse kullan
    if (apiCities && apiCities.length > 0) {
      console.log(`📦 ${countryCode} için Here API'den ${apiCities.length} şehir alındı`);
      return apiCities;
    }
    
    // API'den veri gelmezse statik verilere başvur
    console.log(`❌ ${countryCode} için API'den şehir verisi alınamadı, statik veriler kullanılıyor`);
  } catch (error) {
    console.error(`${countryCode} için şehir verisi alınırken hata:`, error);
  }
  
  // Statik veriler
  if (countryCode === 'TR') {
    return [
      { label: 'İstanbul', value: 'İstanbul', type: 'city' },
      { label: 'Ankara', value: 'Ankara', type: 'city' },
      { label: 'İzmir', value: 'İzmir', type: 'city' },
      { label: 'Antalya', value: 'Antalya', type: 'city' },
      { label: 'Bursa', value: 'Bursa', type: 'city' },
    ];
  } else if (countryCode === 'US') {
    return [
      { label: 'New York', value: 'New York', type: 'city' },
      { label: 'Los Angeles', value: 'Los Angeles', type: 'city' },
      { label: 'Chicago', value: 'Chicago', type: 'city' },
      { label: 'Houston', value: 'Houston', type: 'city' },
      { label: 'Miami', value: 'Miami', type: 'city' },
    ];
  } else if (countryCode === 'GB') {
    return [
      { label: 'Londra', value: 'London', type: 'city' },
      { label: 'Manchester', value: 'Manchester', type: 'city' },
      { label: 'Birmingham', value: 'Birmingham', type: 'city' },
      { label: 'Liverpool', value: 'Liverpool', type: 'city' },
      { label: 'Edinburgh', value: 'Edinburgh', type: 'city' },
    ];
  } else if (countryCode === 'DE') {
    return [
      { label: 'Berlin', value: 'Berlin', type: 'city' },
      { label: 'Münih', value: 'Munich', type: 'city' },
      { label: 'Hamburg', value: 'Hamburg', type: 'city' },
      { label: 'Frankfurt', value: 'Frankfurt', type: 'city' },
      { label: 'Köln', value: 'Cologne', type: 'city' },
    ];
  } else if (countryCode === 'FR') {
    return [
      { label: 'Paris', value: 'Paris', type: 'city' },
      { label: 'Lyon', value: 'Lyon', type: 'city' },
      { label: 'Marsilya', value: 'Marseille', type: 'city' },
      { label: 'Nice', value: 'Nice', type: 'city' },
      { label: 'Toulouse', value: 'Toulouse', type: 'city' },
    ];
  } else if (countryCode === 'IT') {
    return [
      { label: 'Roma', value: 'Rome', type: 'city' },
      { label: 'Milano', value: 'Milan', type: 'city' },
      { label: 'Napoli', value: 'Naples', type: 'city' },
      { label: 'Floransa', value: 'Florence', type: 'city' },
      { label: 'Venedik', value: 'Venice', type: 'city' },
    ];
  } else if (countryCode === 'ES') {
    return [
      { label: 'Madrid', value: 'Madrid', type: 'city' },
      { label: 'Barselona', value: 'Barcelona', type: 'city' },
      { label: 'Sevilla', value: 'Seville', type: 'city' },
      { label: 'Valencia', value: 'Valencia', type: 'city' },
      { label: 'Malaga', value: 'Malaga', type: 'city' },
    ];
  } else if (countryCode === 'NL') {
    return [
      { label: 'Amsterdam', value: 'Amsterdam', type: 'city' },
      { label: 'Rotterdam', value: 'Rotterdam', type: 'city' },
      { label: 'Lahey', value: 'The Hague', type: 'city' },
      { label: 'Utrecht', value: 'Utrecht', type: 'city' },
      { label: 'Eindhoven', value: 'Eindhoven', type: 'city' },
    ];
  } else if (countryCode === 'CH') {
    return [
      { label: 'Zürih', value: 'Zurich', type: 'city' },
      { label: 'Cenevre', value: 'Geneva', type: 'city' },
      { label: 'Bern', value: 'Bern', type: 'city' },
      { label: 'Basel', value: 'Basel', type: 'city' },
      { label: 'Lozan', value: 'Lausanne', type: 'city' },
    ];
  } else if (countryCode === 'CA') {
    return [
      { label: 'Toronto', value: 'Toronto', type: 'city' },
      { label: 'Montreal', value: 'Montreal', type: 'city' },
      { label: 'Vancouver', value: 'Vancouver', type: 'city' },
      { label: 'Calgary', value: 'Calgary', type: 'city' },
      { label: 'Ottawa', value: 'Ottawa', type: 'city' },
    ];
  } else if (countryCode === 'SA') {
    return [
      { label: 'Riyad', value: 'Riyadh', type: 'city' },
      { label: 'Cidde', value: 'Jeddah', type: 'city' },
      { label: 'Mekke', value: 'Mecca', type: 'city' },
      { label: 'Medine', value: 'Medina', type: 'city' },
      { label: 'Dammam', value: 'Dammam', type: 'city' },
    ];
  } else if (countryCode === 'AE') {
    return [
      { label: 'Dubai', value: 'Dubai', type: 'city' },
      { label: 'Abu Dabi', value: 'Abu Dhabi', type: 'city' },
      { label: 'Şardja', value: 'Sharjah', type: 'city' },
      { label: 'Acman', value: 'Ajman', type: 'city' },
      { label: 'Resülhayme', value: 'Ras Al Khaimah', type: 'city' },
    ];
  } else if (countryCode === 'QA') {
    return [
      { label: 'Doha', value: 'Doha', type: 'city' },
      { label: 'El Rayyan', value: 'Al Rayyan', type: 'city' },
      { label: 'El Vakra', value: 'Al Wakrah', type: 'city' },
      { label: 'El Hor', value: 'Al Khor', type: 'city' },
      { label: 'Umm Salal', value: 'Umm Salal', type: 'city' },
    ];
  } else if (countryCode === 'KW') {
    return [
      { label: 'Kuveyt', value: 'Kuwait City', type: 'city' },
      { label: 'El-Ahmedi', value: 'Al Ahmadi', type: 'city' },
      { label: 'Havalli', value: 'Hawalli', type: 'city' },
      { label: 'Salmiya', value: 'Salmiya', type: 'city' },
      { label: 'Farvaniya', value: 'Farwaniya', type: 'city' },
    ];
  } else if (countryCode === 'BH') {
    return [
      { label: 'Manama', value: 'Manama', type: 'city' },
      { label: 'Riffa', value: 'Riffa', type: 'city' },
      { label: 'Muharraq', value: 'Muharraq', type: 'city' },
      { label: 'İsa', value: 'Isa Town', type: 'city' },
      { label: 'Sitra', value: 'Sitra', type: 'city' },
    ];
  } else if (countryCode === 'OM') {
    return [
      { label: 'Maskat', value: 'Muscat', type: 'city' },
      { label: 'Seeb', value: 'Seeb', type: 'city' },
      { label: 'Salalah', value: 'Salalah', type: 'city' },
      { label: 'Sohar', value: 'Sohar', type: 'city' },
      { label: 'Nizwa', value: 'Nizwa', type: 'city' },
    ];
  } else if (countryCode === 'AU') {
    return [
      { label: 'Sydney', value: 'Sydney', type: 'city' },
      { label: 'Melbourne', value: 'Melbourne', type: 'city' },
      { label: 'Brisbane', value: 'Brisbane', type: 'city' },
      { label: 'Perth', value: 'Perth', type: 'city' },
      { label: 'Adelaide', value: 'Adelaide', type: 'city' },
      { label: 'Gold Coast', value: 'Gold Coast', type: 'city' },
      { label: 'Canberra', value: 'Canberra', type: 'city' },
      { label: 'Newcastle', value: 'Newcastle', type: 'city' },
      { label: 'Wollongong', value: 'Wollongong', type: 'city' },
      { label: 'Hobart', value: 'Hobart', type: 'city' },
    ];
  }
  
  return [
    { label: `${countryCode} - Şehir 1`, value: `City 1`, type: 'city' },
    { label: `${countryCode} - Şehir 2`, value: `City 2`, type: 'city' },
    { label: `${countryCode} - Şehir 3`, value: `City 3`, type: 'city' },
    { label: `${countryCode} - Şehir 4`, value: `City 4`, type: 'city' },
    { label: `${countryCode} - Şehir 5`, value: `City 5`, type: 'city' },
  ];
};

// İlçe listesini Here API'den çek
export async function getDistrictsByCity(countryCode: string, city: string): Promise<AddressComponent[]> {
  try {
    // Here API'den ilçeleri çek
    const apiDistricts = await getDistrictsFromAPI(countryCode, city);
    
    // API'den veri geldiyse kullan
    if (apiDistricts && apiDistricts.length > 0) {
      return apiDistricts;
    }
    
    // API'den veri gelmezse statik verilere başvur
    console.log(`❌ ${city}, ${countryCode} için API'den ilçe verisi alınamadı, statik veriler kullanılıyor`);
  } catch (error) {
    console.error(`${city}, ${countryCode} için ilçe verisi alınırken hata:`, error);
  }
  
  // Statik ilçe verileri
  if (countryCode === 'TR') {
    if (city === 'İstanbul') {
      return [
        { label: 'Kadıköy', value: 'Kadıköy', type: 'district' },
        { label: 'Üsküdar', value: 'Üsküdar', type: 'district' },
        { label: 'Beşiktaş', value: 'Beşiktaş', type: 'district' },
        { label: 'Şişli', value: 'Şişli', type: 'district' },
        { label: 'Beyoğlu', value: 'Beyoğlu', type: 'district' },
        { label: 'Bakırköy', value: 'Bakırköy', type: 'district' },
        { label: 'Ümraniye', value: 'Ümraniye', type: 'district' },
      ];
    } else if (city === 'Ankara') {
      return [
        { label: 'Çankaya', value: 'Çankaya', type: 'district' },
        { label: 'Keçiören', value: 'Keçiören', type: 'district' },
        { label: 'Mamak', value: 'Mamak', type: 'district' },
        { label: 'Etimesgut', value: 'Etimesgut', type: 'district' },
      ];
    } else if (city === 'İzmir') {
      return [
        { label: 'Konak', value: 'Konak', type: 'district' },
        { label: 'Karşıyaka', value: 'Karşıyaka', type: 'district' },
        { label: 'Bornova', value: 'Bornova', type: 'district' },
        { label: 'Çeşme', value: 'Çeşme', type: 'district' },
      ];
    }
  }
  
  // İlçe bulunamadıysa varsayılan ilçeler döndür
  return [
    { label: `${city} Merkez`, value: `${city} Merkez`, type: 'district' },
    { label: `${city} Kuzey`, value: `${city} Kuzey`, type: 'district' },
    { label: `${city} Güney`, value: `${city} Güney`, type: 'district' },
    { label: `${city} Doğu`, value: `${city} Doğu`, type: 'district' },
    { label: `${city} Batı`, value: `${city} Batı`, type: 'district' },
  ];
}

// Mahalle listesi
export const getNeighborhoodsByDistrict = getNeighborhoodsFromAPI;

// Sokak listesi (Here API)
export const getStreetsByNeighborhood = getStreetsFromAPI;

// Ülkeleri gruplandırmak için yardımcı fonksiyon
const getCountryGroup = (countryCode: string): string => {
  // Amerika
  if (countryCode === 'US') {
    return 'Amerika';
  }
  
  // Avrupa ülkeleri
  const europeanCountries = ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'CH', 'PL', 'SE', 'BE', 'AT', 'DK', 'FI', 'NO', 'PT', 'IE', 'GR'];
  if (europeanCountries.includes(countryCode)) {
    return 'Avrupa';
  }
  
  // Körfez ülkeleri
  const gulfCountries = ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'];
  if (gulfCountries.includes(countryCode)) {
    return 'Arap Körfezi';
  }
  
  // Diğer özel ülkeler
  if (countryCode === 'TR') return 'Türkiye';
  if (countryCode === 'CA') return 'Kanada';
  if (countryCode === 'AU') return 'Avustralya';
  
  // Diğer ülkeler
  return 'Diğer';
};

// Dropdown'da kullanılabilecek biçimlendirilmiş ülke listesi
export const getFormattedCountries = (): SelectOption[] => {
  // Sadece bizim tanımladığımız ülkeleri kullan, API'den gelen tüm ülkeleri değil
  return COUNTRIES.map(country => ({
    value: country.value,
    label: country.label,
    group: getCountryGroup(country.value) // Gruplandırma bilgisini ekle
  }));
};

// Dropdown'da gruplu ülke listesi oluşturmak için
export const getGroupedCountries = (): { label: string; options: SelectOption[] }[] => {
  const formattedCountries = getFormattedCountries();
  
  // Ülkeleri gruplarına göre ayır
  const groups: Record<string, SelectOption[]> = {};
  formattedCountries.forEach(country => {
    const group = (country as any).group || 'Diğer';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(country);
  });
  
  // Grupları alfabetik sırala, ancak özel grupları önce göster
  const groupOrder = ['Amerika', 'Avrupa', 'Türkiye', 'Kanada', 'Arap Körfezi', 'Avustralya', 'Diğer'];
  
  // Grupları belirli bir sırada döndür
  return groupOrder
    .filter(group => groups[group] && groups[group].length > 0)
    .map(group => ({
      label: group,
      options: groups[group].sort((a, b) => a.label.localeCompare(b.label))
    }));
};

// Dropdown'da kullanılabilecek biçimlendirilmiş eyalet listesi
export const getFormattedStates = (countryCode: string): { value: string; label: string; countryCode: string }[] => {
  const states = getStatesByCountry(countryCode);
  return states.map(state => ({
    value: state.value,
    label: state.label,
    countryCode: state.countryCode
  }));
};

// Amerika eyaletleri için şehir listesi
export const getCitiesForUSState = (stateCode: string): CityOption[] => {
  // Amerika eyaletleri için büyük şehirleri döndür
  switch (stateCode) {
    case 'NY':
      return [
        { value: 'New York', label: 'New York', stateCode: 'NY', countryCode: 'US' },
        { value: 'Buffalo', label: 'Buffalo', stateCode: 'NY', countryCode: 'US' },
        { value: 'Rochester', label: 'Rochester', stateCode: 'NY', countryCode: 'US' },
        { value: 'Syracuse', label: 'Syracuse', stateCode: 'NY', countryCode: 'US' },
        { value: 'Albany', label: 'Albany', stateCode: 'NY', countryCode: 'US' },
      ];
    case 'CA':
      return [
        { value: 'Los Angeles', label: 'Los Angeles', stateCode: 'CA', countryCode: 'US' },
        { value: 'San Francisco', label: 'San Francisco', stateCode: 'CA', countryCode: 'US' },
        { value: 'San Diego', label: 'San Diego', stateCode: 'CA', countryCode: 'US' },
        { value: 'San Jose', label: 'San Jose', stateCode: 'CA', countryCode: 'US' },
        { value: 'Sacramento', label: 'Sacramento', stateCode: 'CA', countryCode: 'US' },
      ];
    case 'TX':
      return [
        { value: 'Houston', label: 'Houston', stateCode: 'TX', countryCode: 'US' },
        { value: 'Dallas', label: 'Dallas', stateCode: 'TX', countryCode: 'US' },
        { value: 'Austin', label: 'Austin', stateCode: 'TX', countryCode: 'US' },
        { value: 'San Antonio', label: 'San Antonio', stateCode: 'TX', countryCode: 'US' },
        { value: 'Fort Worth', label: 'Fort Worth', stateCode: 'TX', countryCode: 'US' },
      ];
    case 'FL':
      return [
        { value: 'Miami', label: 'Miami', stateCode: 'FL', countryCode: 'US' },
        { value: 'Orlando', label: 'Orlando', stateCode: 'FL', countryCode: 'US' },
        { value: 'Tampa', label: 'Tampa', stateCode: 'FL', countryCode: 'US' },
        { value: 'Jacksonville', label: 'Jacksonville', stateCode: 'FL', countryCode: 'US' },
        { value: 'Fort Lauderdale', label: 'Fort Lauderdale', stateCode: 'FL', countryCode: 'US' },
      ];
    case 'IL':
      return [
        { value: 'Chicago', label: 'Chicago', stateCode: 'IL', countryCode: 'US' },
        { value: 'Aurora', label: 'Aurora', stateCode: 'IL', countryCode: 'US' },
        { value: 'Naperville', label: 'Naperville', stateCode: 'IL', countryCode: 'US' },
        { value: 'Joliet', label: 'Joliet', stateCode: 'IL', countryCode: 'US' },
        { value: 'Rockford', label: 'Rockford', stateCode: 'IL', countryCode: 'US' },
      ];
    default:
      // Diğer eyaletler için varsayılan şehirler
      return [
        { value: `${stateCode} Main City`, label: `${stateCode} Merkez`, stateCode, countryCode: 'US' },
        { value: `${stateCode} North City`, label: `${stateCode} Kuzey`, stateCode, countryCode: 'US' },
        { value: `${stateCode} South City`, label: `${stateCode} Güney`, stateCode, countryCode: 'US' },
        { value: `${stateCode} East City`, label: `${stateCode} Doğu`, stateCode, countryCode: 'US' },
        { value: `${stateCode} West City`, label: `${stateCode} Batı`, stateCode, countryCode: 'US' },
      ];
  }
};

// Şehir listelerinin asenkron olarak formatlanması - artık hem state hem de country destekliyor
export const getFormattedCities = async (countryCode: string, stateCode?: string): Promise<{ value: string; label: string; stateCode?: string; countryCode?: string }[]> => {
  let citiesData: CityData[] = [];
  
  if (stateCode) {
    // stateCode varsa getCitiesByState'i kullan ve sonuçları dönüştür
    const stateCities = getCitiesByState(countryCode, stateCode);
    citiesData = stateCities.map(city => ({
      value: city.value,
      label: city.label,
      stateCode: stateCode,
      countryCode: countryCode,
      type: 'city'
    }));
  } else {
    // stateCode yoksa getCitiesByCountry'yi kullan ve tip dönüşümü yap
    const countryCities = await getCitiesByCountry(countryCode);
    citiesData = countryCities.map(city => ({
      value: city.value,
      label: city.label,
      countryCode: countryCode,
      type: city.type
    }));
  }
  
  return citiesData.map(city => ({
    value: city.value,
    label: city.label,
    stateCode: city.stateCode || '',
    countryCode: city.countryCode || countryCode
  }));
}; 