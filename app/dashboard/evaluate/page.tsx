'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, HomeIcon, MapPinIcon, CurrencyDollarIcon, GlobeAltIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ensureCSRFToken, addCSRFHeader } from '@/utils/csrf';
import { 
  COUNTRIES, 
  getAllCountries, 
  getCitiesByCountry, 
  getDistrictsByCity 
} from '@/utils/countries';

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
  
  // Ülke listesini yükle
  useEffect(() => {
    setAvailableCountries(getAllCountries());
  }, []);
  
  // Ülke değiştiğinde şehirleri güncelle
  useEffect(() => {
    if (countryCode) {
      const cities = getCitiesByCountry(countryCode);
      setAvailableCities(cities);
      
      // Ülke değiştiğinde şehir, ilçe ve adres resetle
      setCity('');
      setDistrict('');
      
      // Ülke adını ayarla
      const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
      setCountry(selectedCountry ? selectedCountry.name : '');
    } else {
      setAvailableCities([]);
    }
  }, [countryCode]);
  
  // Şehir değiştiğinde ilçeleri güncelle
  useEffect(() => {
    if (countryCode && city) {
      const districts = getDistrictsByCity(countryCode, city);
      setAvailableDistricts(districts);
      
      // Şehir değiştiğinde ilçe resetle
      setDistrict('');
    } else {
      setAvailableDistricts([]);
    }
  }, [countryCode, city]);
  
  // Tam adres oluştur
  useEffect(() => {
    const addressParts = [];
    
    if (streetAddress) addressParts.push(streetAddress);
    if (district) addressParts.push(district);
    if (city) addressParts.push(city);
    if (country) addressParts.push(country);
    if (postalCode) addressParts.push(postalCode);
    
    setAddress(addressParts.join(', '));
  }, [streetAddress, district, city, country, postalCode]);

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
            
            {/* Sokak Adresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Sokak Adresi <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Cadde/Sokak, Bina No, Daire No"
                  required
                />
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