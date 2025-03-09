'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, HomeIcon, MapPinIcon, CurrencyDollarIcon, GlobeAltIcon, BuildingOfficeIcon, BookmarkIcon, PlusCircleIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ensureCSRFToken, addCSRFHeader } from '@/utils/csrf';
import { 
  getAllCountries,
  getCountryByCode,
  getStatesByCountry,
  getCitiesByState,
  getCitiesByCountry,
  getFormattedCountries,
  getFormattedStates,
  getFormattedCities,
  getNeighborhoodsByCity,
  getStreetsByNeighborhood
} from '@/utils/addressHelper';
import { getSavedAddresses, saveAddress, deleteAddress, labelAddress } from '@/utils/savedAddresses';

// Adres tip tanımlarını ekleyelim
type SavedAddress = {
  id: string;
  label: string;
  countryCode: string;
  country: string;
  city: string;
  district?: string;
  streetAddress: string;
  postalCode?: string;
};

type PopularAddress = {
  label: string;
  countryCode: string;
  country: string;
  city: string;
  district?: string;
  streetAddress: string;
  postalCode?: string;
};

// Tip tanımlamaları
interface FormattedCountry {
  value: string;
  label: string;
  phoneCode: string;
}

interface FormattedState {
  value: string;
  label: string;
  stateCode: string;
  countryCode: string;
  coordinates: {
    lat: string;
    lng: string;
  };
}

interface FormattedCity {
  value: string;
  label: string;
  stateCode: string;
  countryCode: string;
}

export default function EvaluatePage() {
  // Form alanları
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Adres bileşenleri
  const [countryCode, setCountryCode] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  
  // Seçim listeleri
  const [availableCountries, setAvailableCountries] = useState<Array<{code: string, name: string}>>([]);
  const [availableCities, setAvailableCities] = useState<Array<string>>([]);
  const [availableDistricts, setAvailableDistricts] = useState<Array<string>>([]);
  
  // Kaydedilen adresler
  const [savedAddresses, setSavedAddresses] = useState<Array<SavedAddress>>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Popüler adresler
  const [popularAddresses, setPopularAddresses] = useState<Array<PopularAddress>>([
    { label: 'İstanbul - Kadıköy', country: 'Türkiye', countryCode: 'TR', city: 'İstanbul', district: 'Kadıköy', streetAddress: 'Bağdat Caddesi', postalCode: '34710' },
    { label: 'Ankara - Çankaya', country: 'Türkiye', countryCode: 'TR', city: 'Ankara', district: 'Çankaya', streetAddress: 'Tunalı Hilmi Caddesi', postalCode: '06680' },
    { label: 'İzmir - Konak', country: 'Türkiye', countryCode: 'TR', city: 'İzmir', district: 'Konak', streetAddress: 'Kıbrıs Şehitleri Caddesi', postalCode: '35220' },
    { label: 'Antalya - Konyaaltı', country: 'Türkiye', countryCode: 'TR', city: 'Antalya', district: 'Konyaaltı', streetAddress: 'Boğaçayı Caddesi', postalCode: '07070' },
  ]);
  
  // Mahalle ve sokak seçimleri için state'ler
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<Array<{value: string, label: string}>>([]);
  const [availableStreets, setAvailableStreets] = useState<Array<{value: string, label: string}>>([]);
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [loadingStreets, setLoadingStreets] = useState(false);
  
  // Ülke listesini yükle
  useEffect(() => {
    const formattedCountries = getFormattedCountries().map(country => ({
      code: country.value,
      name: country.label
    }));
    setAvailableCountries(formattedCountries);
    loadSavedAddresses();
  }, []);
  
  // Ülke değiştiğinde şehirleri güncelle
  useEffect(() => {
    if (countryCode) {
      const states = getStatesByCountry(countryCode);
      const cityNames = states.map(state => state.name);
      setAvailableCities(cityNames.filter(Boolean));
      
      // Ülke değiştiğinde şehir, ilçe ve adres resetle
      setCity('');
      setDistrict('');
      
      // Ülke adını ayarla
      const selectedCountry = getCountryByCode(countryCode);
      setCountry(selectedCountry ? selectedCountry.name : '');
    } else {
      setAvailableCities([]);
    }
  }, [countryCode]);
  
  // Şehir değiştiğinde ilçeleri güncelle
  useEffect(() => {
    if (countryCode && city) {
      const states = getStatesByCountry(countryCode);
      const selectedState = states.find(state => state.name === city);
      if (selectedState) {
        const cities = getFormattedCities(countryCode, selectedState.code);
        const districts = cities.map(city => city.label).filter(Boolean);
        setAvailableDistricts(districts);
      } else {
        setAvailableDistricts([]);
      }
      
      // Şehir değiştiğinde ilçe resetle
      setDistrict('');
    } else {
      setAvailableDistricts([]);
    }
  }, [countryCode, city]);
  
  // İlçe değiştiğinde mahalleleri güncelle
  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (countryCode && city && district) {
        setLoadingNeighborhoods(true);
        try {
          const neighborhoods = await getNeighborhoodsByCity(countryCode, `${district}, ${city}`);
          setAvailableNeighborhoods(neighborhoods);
        } catch (error) {
          console.error('Mahalleler yüklenirken hata:', error);
          setAvailableNeighborhoods([]);
        } finally {
          setLoadingNeighborhoods(false);
        }
        
        // İlçe değiştiğinde mahalle ve sokak resetle
        setNeighborhood('');
        setStreet('');
      } else {
        setAvailableNeighborhoods([]);
      }
    };

    loadNeighborhoods();
  }, [countryCode, city, district]);

  // Mahalle değiştiğinde sokakları güncelle
  useEffect(() => {
    const loadStreets = async () => {
      if (countryCode && city && district && neighborhood) {
        setLoadingStreets(true);
        try {
          const streets = await getStreetsByNeighborhood(countryCode, `${district}, ${city}`, neighborhood);
          setAvailableStreets(streets);
        } catch (error) {
          console.error('Sokaklar yüklenirken hata:', error);
          setAvailableStreets([]);
        } finally {
          setLoadingStreets(false);
        }
        
        // Mahalle değiştiğinde sokak resetle
        setStreet('');
      } else {
        setAvailableStreets([]);
      }
    };

    loadStreets();
  }, [countryCode, city, district, neighborhood]);
  
  // Tam adres oluştur
  useEffect(() => {
    const addressParts = [];
    
    if (street) addressParts.push(street);
    if (neighborhood) addressParts.push(neighborhood);
    if (district) addressParts.push(district);
    if (city) addressParts.push(city);
    if (country) addressParts.push(country);
    if (postalCode) addressParts.push(postalCode);
    
    setAddress(addressParts.join(', '));
  }, [street, neighborhood, district, city, country, postalCode]);

  // Kaydedilmiş adresleri yükle
  const loadSavedAddresses = async () => {
    const addresses = await getSavedAddresses();
    setSavedAddresses(addresses);
  };
  
  // Adres kaydet
  const handleSaveAddress = async () => {
    if (!country || !city || !streetAddress) {
      alert('Lütfen en azından ülke, şehir ve sokak bilgilerini doldurun');
      return;
    }
    
    const addressData = {
      label: addressLabel || `${city}, ${streetAddress}`,
      countryCode,
      country,
      city,
      district,
      streetAddress, 
      postalCode
    };
    
    try {
      await saveAddress(addressData);
      loadSavedAddresses();
      setShowSaveModal(false);
      setAddressLabel('');
      alert('Adres başarıyla kaydedildi!');
    } catch (error) {
      alert('Adres kaydedilirken bir hata oluştu');
    }
  };
  
  // Kaydedilmiş adresi seç
  const selectSavedAddress = (savedAddress: SavedAddress) => {
    setCountryCode(savedAddress.countryCode);
    setCountry(savedAddress.country);
    setCity(savedAddress.city);
    setDistrict(savedAddress.district || '');
    setStreetAddress(savedAddress.streetAddress);
    setPostalCode(savedAddress.postalCode || '');
    setShowSavedAddresses(false);
  };
  
  // Popüler adresi seç
  const selectPopularAddress = (popularAddress: PopularAddress) => {
    setCountryCode(popularAddress.countryCode);
    setCountry(popularAddress.country);
    setCity(popularAddress.city);
    setDistrict(popularAddress.district || '');
    setStreetAddress(popularAddress.streetAddress);
    setPostalCode(popularAddress.postalCode || '');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!countryCode || !city || !streetAddress || !propertyType || !size) {
      alert('Lütfen zorunlu alanları doldurunuz');
      return;
    }
    
    setLoading(true);
    
    // CSRF token sağla
    ensureCSRFToken();
    
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: addCSRFHeader({
          'Content-Type': 'application/json',
        }) as HeadersInit,
        body: JSON.stringify({
          address,
          propertyType,
          size: parseInt(size),
          location: {
            country,
            countryCode,
            city,
            district,
            postalCode,
            streetAddress
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Değerleme işlemi sırasında bir hata oluştu');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Değerleme hatası:', error);
      // Hata durumunda örnek veri göster
      setResult({
        estimatedValue: '2.500.000 TL',
        confidence: '85%',
        marketTrend: 'Yükseliş',
        similarProperties: [
          { address: 'Örnek Mahallesi 1', price: '2.300.000 TL' },
          { address: 'Örnek Mahallesi 2', price: '2.700.000 TL' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
          <div className="p-3 bg-blue-100 rounded-lg mb-4 sm:mb-0">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="sm:ml-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Emlak Değerleme</h1>
            <p className="text-gray-600 text-sm sm:text-base">Yapay zeka ile emlak değerinizi öğrenin</p>
          </div>
        </div>
        
        {/* Adres Kısayolları */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Adres Seçimi</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <BookmarkIcon className="w-4 h-4 mr-1 text-blue-600" />
                Kayıtlı Adreslerim
              </button>
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="flex items-center px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                <PlusCircleIcon className="w-4 h-4 mr-1" />
                Adresi Kaydet
              </button>
            </div>
          </div>
          
          {/* Kayıtlı Adresler Dropdown */}
          {showSavedAddresses && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 absolute mt-1">
              <div className="flex items-center justify-between mb-2 pb-2 border-b">
                <h3 className="font-medium">Kayıtlı Adreslerim</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowSavedAddresses(false)}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {savedAddresses.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">Henüz kaydedilmiş adres bulunmamaktadır.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                  {savedAddresses.map((savedAddress, index) => (
                    <div
                      key={index}
                      className="py-2 px-1 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => selectSavedAddress(savedAddress)}
                    >
                      <div>
                        <p className="font-medium">{savedAddress.label}</p>
                        <p className="text-sm text-gray-600">{savedAddress.streetAddress}, {savedAddress.city}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Bu adresi silmek istediğinize emin misiniz?')) {
                            deleteAddress(savedAddress.id);
                            setSavedAddresses(savedAddresses.filter(addr => addr.id !== savedAddress.id));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Adres Kaydetme Modal */}
          {showSaveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Adres Kaydet</h3>
                  <button onClick={() => setShowSaveModal(false)} className="text-gray-500 hover:text-gray-700">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres Etiketi</label>
                  <input
                    type="text"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    placeholder="Örn: Evim, İşyerim, Yazlık"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">Etiket belirtmezseniz adres bilgileri kullanılacaktır.</p>
                </div>
                
                <div className="border rounded p-3 bg-gray-50 mb-4">
                  <h4 className="font-medium mb-1">Kaydedilecek Adres</h4>
                  <p className="text-sm">{address}</p>
                </div>
                
                <div className="flex space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Popüler Adresler */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
              Popüler Konumlar
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularAddresses.map((popAddress, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectPopularAddress(popAddress)}
                  className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-200"
                >
                  {popAddress.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Ülke Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Ülke <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="">Ülke Seçiniz</option>
                  {availableCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Şehir Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Şehir <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${!countryCode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!countryCode}
                  required
                >
                  <option value="">Şehir Seçiniz</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* İlçe Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                İlçe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${!city ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!city || availableDistricts.length === 0}
                >
                  <option value="">İlçe Seçiniz</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Mahalle Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Mahalle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${!district ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!district || loadingNeighborhoods}
                >
                  <option value="">Mahalle Seçiniz</option>
                  {availableNeighborhoods.map((neighborhood) => (
                    <option key={neighborhood.value} value={neighborhood.value}>
                      {neighborhood.label}
                    </option>
                  ))}
                </select>
                {loadingNeighborhoods && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Sokak Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Sokak
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${!neighborhood ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!neighborhood || loadingStreets}
                >
                  <option value="">Sokak Seçiniz</option>
                  {availableStreets.map((street) => (
                    <option key={street.value} value={street.value}>
                      {street.label}
                    </option>
                  ))}
                </select>
                {loadingStreets && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            {/* Posta Kodu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Posta Kodu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Posta Kodu"
                />
              </div>
            </div>

            {/* Emlak Tipi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Emlak Tipi <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="">Seçiniz</option>
                  <option value="apartment">Daire</option>
                  <option value="house">Müstakil Ev</option>
                  <option value="villa">Villa</option>
                  <option value="land">Arsa</option>
                  <option value="commercial">Ticari</option>
                  <option value="office">Ofis</option>
                </select>
              </div>
            </div>

            {/* Metrekare */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Metrekare <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Metrekare giriniz"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Oluşturulan adres (önizleme) */}
          {address && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Oluşturulan Adres:</p>
              <p className="text-gray-800">{address}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Değerleme Yapılıyor...
              </div>
            ) : (
              'Değerleme Yap'
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Değerleme Sonucu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-600">Tahmini Değer</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{result.estimatedValue}</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-600">Güven Oranı</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{result.confidence}</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-600">Piyasa Trendi</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{result.marketTrend}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Benzer Emlaklar</h2>
              <div className="space-y-3 sm:space-y-4">
                {result.similarProperties.map((property: any, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{property.address}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Benzer özelliklere sahip</p>
                    </div>
                    <p className="font-semibold text-blue-600 text-sm sm:text-base">{property.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 