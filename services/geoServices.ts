import axios from 'axios';
import trDistricts from '@/data/tr_districts.json';
import trIstanbulNeighborhoods from '@/data/tr_istanbul_neighborhoods.json';

const API_KEY = process.env.HERE_API_KEY;

interface GeoResponse {
  label: string;
  value: string;
  type: string;
}

interface Districts {
  [key: string]: Array<{
    title: string;
    position: {
      lat: number;
      lng: number;
    };
  }>;
}

interface Neighborhoods {
  [city: string]: {
    [district: string]: string[] | Array<{
      label: string;
      value: string;
      type: string;
      position: {
        lat: number;
        lng: number;
      };
    }>;
  };
}

interface TrDistricts {
  [key: string]: string[];
}

interface TrIstanbulNeighborhoods {
  [key: string]: string[];
}

const typedTrDistricts = trDistricts as TrDistricts;
const typedTrIstanbulNeighborhoods = trIstanbulNeighborhoods as TrIstanbulNeighborhoods;

const countryDistrictsMap: Record<string, Districts | TrDistricts> = {
  TR: typedTrDistricts,
};

const countryNeighborhoodsMap = {
  TR: { Istanbul: typedTrIstanbulNeighborhoods },
};

export function getCountries() {
  return ['Türkiye']; // Sadece Türkiye
}

export function getDistricts(country: string) {
  if (country === 'Türkiye') {
    return trDistricts;
  }
  return {};
}

export function getNeighborhoods(country: string, district: string) {
  if (country === 'Türkiye') {
    if (district === 'İstanbul') {
      return trIstanbulNeighborhoods;
    }
    // Diğer iller için...
  }
  return [];
}

export async function getCitiesByCountryHere(countryCode: string): Promise<GeoResponse[]> {
  try {
    const districts = countryDistrictsMap[countryCode as keyof typeof countryDistrictsMap];
    if (districts) {
      return Object.keys(districts).map(city => ({
        label: city,
        value: city,
        type: 'city'
      }));
    }

    const response = await axios.get('https://geocode.search.hereapi.com/v1/geocode', {
      params: {
        q: `cities in country ${countryCode}`,
        apiKey: API_KEY,
        types: 'city',
        limit: 100
      }
    });

    if (response.data.items) {
      return response.data.items
        .filter((item: any) => item.resultType === 'city')
        .map((city: any) => ({
          label: city.address.city,
          value: city.address.city,
          type: 'city'
        }))
        .filter((city: GeoResponse, index: number, self: GeoResponse[]) =>
          index === self.findIndex((t) => t.value === city.value)
        );
    }

    return [];
  } catch (error) {
    console.error('Şehir verileri alınamadı:', error);
    return [];
  }
}

export async function getDistrictsByCity(city: string, countryCode: string): Promise<GeoResponse[]> {
  try {
    const districts = countryDistrictsMap[countryCode as keyof typeof countryDistrictsMap];
    if (districts) {
      if (countryCode === 'TR') {
        const trDistricts = districts as TrDistricts;
        return (trDistricts[city] || []).map(district => ({
          label: district,
          value: district,
          type: 'district'
        }));
      } else {
        const otherDistricts = districts as Districts;
        return (otherDistricts[city] || []).map(district => ({
          label: district.title,
          value: district.title,
          type: 'district'
        }));
      }
    }

    const response = await axios.get('https://geocode.search.hereapi.com/v1/geocode', {
      params: {
        q: `districts in ${city}`,
        apiKey: API_KEY,
        in: `countryCode:${countryCode}`,
        types: 'administrativeArea',
        limit: 100
      }
    });

    if (response.data.items) {
      return response.data.items
        .filter((item: any) => 
          item.resultType === 'administrativeArea' && 
          item.address.city?.toLowerCase() === city.toLowerCase()
        )
        .map((district: any) => ({
          label: district.address.district || district.title,
          value: district.address.district || district.title,
          type: 'district'
        }))
        .filter((district: GeoResponse, index: number, self: GeoResponse[]) =>
          index === self.findIndex((t) => t.value.toLowerCase() === district.value.toLowerCase())
        );
    }

    return [];
  } catch (error) {
    console.error('İlçe verileri alınamadı:', error);
    return [];
  }
}

export async function getNeighborhoodsByDistrict(
  district: string,
  city: string,
  countryCode: string
): Promise<GeoResponse[]> {
  try {
    const countryNeighborhoods = countryNeighborhoodsMap[countryCode as keyof typeof countryNeighborhoodsMap];
    if (countryNeighborhoods) {
      if (countryCode === 'TR' && city.toLowerCase() === 'istanbul') {
        const istanbulNeighborhoods = (countryNeighborhoods as { Istanbul: TrIstanbulNeighborhoods }).Istanbul;
        return (istanbulNeighborhoods[district] || []).map(neighborhood => ({
          label: neighborhood,
          value: neighborhood,
          type: 'neighborhood'
        }));
      } else {
        // TR dışındaki ülkeler için şu an veri olmadığından boş dizi döndürüyoruz
        return [];
      }
    }

    const response = await axios.get('https://geocode.search.hereapi.com/v1/geocode', {
      params: {
        q: `neighborhoods in ${district}, ${city}`,
        apiKey: API_KEY,
        in: `countryCode:${countryCode}`,
        types: 'administrativeArea',
        limit: 100
      }
    });

    if (response.data.items) {
      return response.data.items
        .filter((item: any) => 
          item.resultType === 'administrativeArea' && 
          item.address.district?.toLowerCase() === district.toLowerCase()
        )
        .map((neighborhood: any) => ({
          label: neighborhood.address.subdistrict || neighborhood.title,
          value: neighborhood.address.subdistrict || neighborhood.title,
          type: 'neighborhood'
        }))
        .filter((neighborhood: GeoResponse, index: number, self: GeoResponse[]) =>
          index === self.findIndex((t) => t.value.toLowerCase() === neighborhood.value.toLowerCase())
        );
    }

    return [];
  } catch (error) {
    console.error('Mahalle verileri alınamadı:', error);
    return [];
  }
}

export async function getStreetsByNeighborhood(
  neighborhood: string,
  district: string,
  city: string,
  countryCode: string
): Promise<GeoResponse[]> {
  try {
    const response = await axios.get('https://geocode.search.hereapi.com/v1/geocode', {
      params: {
        q: `streets in ${neighborhood}, ${district}, ${city}`,
        apiKey: API_KEY,
        in: `countryCode:${countryCode}`,
        types: 'street',
        limit: 100
      }
    });

    if (response.data.items) {
      return response.data.items
        .filter((item: any) => 
          item.resultType === 'street' && 
          item.address.district?.toLowerCase() === district.toLowerCase()
        )
        .map((street: any) => ({
          label: street.address.street || street.title,
          value: street.address.street || street.title,
          type: 'street'
        }))
        .filter((street: GeoResponse, index: number, self: GeoResponse[]) =>
          index === self.findIndex((t) => t.value.toLowerCase() === street.value.toLowerCase())
        );
    }

    return [];
  } catch (error) {
    console.error('Sokak verileri alınamadı:', error);
    return [];
  }
} 