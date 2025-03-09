// countries-states-cities kütüphanesini kullanarak adres yardımcı fonksiyonları

import { Country, State, City } from 'country-state-city';

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

// Tüm ülkeleri getir
export const getAllCountries = (): { code: string; name: string; phoneCode: string; flag: string }[] => {
  try {
    const countries = Country.getAllCountries() || [];
    return countries.map((country) => ({
      code: country.isoCode,
      name: country.name,
      phoneCode: country.phonecode,
      flag: country.flag || ''
    }));
  } catch (error) {
    console.error('Ülkeler yüklenirken hata:', error);
    return [];
  }
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

// Ülke koduna göre eyaletleri/bölgeleri getir
export const getStatesByCountry = (countryCode: string): { code: string; name: string; countryCode: string }[] => {
  try {
    const states = State.getStatesOfCountry(countryCode) || [];
    return states.map((state) => ({
      code: state.isoCode,
      name: state.name,
      countryCode: state.countryCode
    }));
  } catch (error) {
    console.error(`Eyaletler yüklenirken hata (${countryCode}):`, error);
    return [];
  }
};

// Ülke ve eyalet koduna göre şehirleri getir
export const getCitiesByState = (countryCode: string, stateCode: string): { name: string; stateCode: string; countryCode: string; latitude: string; longitude: string }[] => {
  try {
    const cities = City.getCitiesOfState(countryCode, stateCode) || [];
    return cities.map((city) => ({
      name: city.name,
      stateCode: city.stateCode,
      countryCode: city.countryCode,
      latitude: city.latitude || '',
      longitude: city.longitude || ''
    }));
  } catch (error) {
    console.error(`Şehirler yüklenirken hata (${countryCode}, ${stateCode}):`, error);
    return [];
  }
};

// Ülke koduna göre tüm şehirleri getir (eyalet olmadan)
export const getCitiesByCountry = (countryCode: string): { name: string; stateCode: string; countryCode: string; latitude: string; longitude: string }[] => {
  try {
    const cities = City.getCitiesOfCountry(countryCode) || [];
    return cities.map((city) => ({
      name: city.name,
      stateCode: city.stateCode || '',
      countryCode: city.countryCode,
      latitude: city.latitude || '',
      longitude: city.longitude || ''
    }));
  } catch (error) {
    console.error(`Şehirler yüklenirken hata (${countryCode}):`, error);
    return [];
  }
};

// Google Places API ile mahalle verilerini getir
export const getNeighborhoodsByCity = async (countryCode: string, cityName: string): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await fetch(`/api/address/places/neighborhoods?country=${countryCode}&city=${cityName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Mahalle verileri alınamadı');
    }

    const data = await response.json();
    return data.predictions.map((prediction: any) => ({
      value: prediction.place_id,
      label: prediction.structured_formatting.main_text
    }));
  } catch (error) {
    console.error('Mahalle verileri getirilirken hata:', error);
    return [];
  }
};

// Google Places API ile sokak verilerini getir
export const getStreetsByNeighborhood = async (countryCode: string, cityName: string, neighborhood: string): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await fetch(`/api/address/places/streets?country=${countryCode}&city=${cityName}&neighborhood=${neighborhood}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Sokak verileri alınamadı');
    }

    const data = await response.json();
    return data.predictions.map((prediction: any) => ({
      value: prediction.place_id,
      label: prediction.structured_formatting.main_text
    }));
  } catch (error) {
    console.error('Sokak verileri getirilirken hata:', error);
    return [];
  }
};

// Dropdown'da kullanılabilecek biçimlendirilmiş ülke listesi
export const getFormattedCountries = (): { value: string; label: string; phoneCode: string }[] => {
  const countries = getAllCountries();
  return countries.map(country => ({
    value: country.code,
    label: `${country.flag} ${country.name}`,
    phoneCode: country.phoneCode
  }));
};

// Dropdown'da kullanılabilecek biçimlendirilmiş eyalet listesi
export const getFormattedStates = (countryCode: string): { value: string; label: string; countryCode: string }[] => {
  const states = getStatesByCountry(countryCode);
  return states.map(state => ({
    value: state.code,
    label: state.name,
    countryCode: state.countryCode
  }));
};

// Dropdown'da kullanılabilecek biçimlendirilmiş şehir listesi
export const getFormattedCities = (countryCode: string, stateCode?: string): { value: string; label: string; stateCode: string; countryCode: string; coordinates: { lat: string; lng: string } }[] => {
  let cities;
  
  if (stateCode) {
    cities = getCitiesByState(countryCode, stateCode);
  } else {
    cities = getCitiesByCountry(countryCode);
  }
  
  return cities.map(city => ({
    value: city.name,
    label: city.name,
    stateCode: city.stateCode,
    countryCode: city.countryCode,
    coordinates: {
      lat: city.latitude,
      lng: city.longitude
    }
  }));
}; 