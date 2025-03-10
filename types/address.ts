export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface AddressComponent {
  value: string;
  label: string;
  type: 'country' | 'state' | 'city' | 'district' | 'neighborhood' | 'street';
  location?: GeoLocation;
}

export interface AddressSearchParams {
  countryCode: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  language?: string;
} 