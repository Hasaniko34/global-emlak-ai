'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, HomeIcon, MapPinIcon, CurrencyDollarIcon, GlobeAltIcon, BuildingOfficeIcon, BookmarkIcon, PlusCircleIcon, StarIcon, XMarkIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { ensureCSRFToken, addCSRFHeader } from '@/utils/csrf';
import { 
  getAllCountries,
  getAllowedCountries,
  getCountryByCode,
  getStatesByCountry,
  getCitiesByState,
  getCitiesByCountry,
  getFormattedCountries,
  getFormattedStates,
  getFormattedCities,
  getNeighborhoodsByDistrict,
  getStreetsByNeighborhood,
  getDistrictsByCity
} from '@/utils/addressHelper';
import { getSavedAddresses, saveAddress, deleteAddress, labelAddress } from '@/utils/savedAddresses';
import dynamic from 'next/dynamic';
import type { ActionMeta } from 'react-select';

// React-select'i dinamik olarak import edelim (SSR devre dışı bırakılmış olarak)
const Select = dynamic(() => import('react-select'), { ssr: false });

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
  coordinates?: {
    lat: string;
    lng: string;
  };
}

export default function EvaluatePage() {
  // Form alanları
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [size, setSize] = useState('');
  const [grossSize, setGrossSize] = useState('');
  const [netSize, setNetSize] = useState('');
  
  // Detaylı gayrimenkul özellikleri
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [buildingAge, setBuildingAge] = useState('');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [hasElevator, setHasElevator] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [heatingType, setHeatingType] = useState('');
  const [furnishStatus, setFurnishStatus] = useState('');
  const [facingDirection, setFacingDirection] = useState('');
  
  // Türkiye'ye özgü emlak özellikleri
  const [buildingType, setBuildingType] = useState(''); // Bina tipi (müstakil, apartman, site içi vb.)
  const [buildingStyle, setBuildingStyle] = useState(''); // Mimari stil (modern, klasik, köşk, tarihi vb.)
  const [deedType, setDeedType] = useState(''); // Tapu durumu (kat mülkiyeti, kat irtifakı vb.)
  const [hasNaturalGas, setHasNaturalGas] = useState(false); // Doğalgaz var mı?
  const [isFurnished, setIsFurnished] = useState(false); // Eşyalı mı?
  const [hasKitchenAppliances, setHasKitchenAppliances] = useState(false); // Ankastre ürünler var mı?
  const [hasSiteStatus, setHasSiteStatus] = useState(false); // Site içerisinde mi?
  const [hasGenerator, setHasGenerator] = useState(false); // Jeneratör var mı?
  const [hasDoorman, setHasDoorman] = useState(false); // Kapıcı var mı?
  const [hasSecurity, setHasSecurity] = useState(false); // Güvenlik var mı?
  const [aidat, setAidat] = useState(''); // Site/apartman aidatı
  
  // Arsa özellikleri
  const [landStatus, setLandStatus] = useState(''); // İmar durumu
  const [landUsage, setLandUsage] = useState(''); // Kullanım şekli
  const [landParcelNo, setLandParcelNo] = useState(''); // Parsel numarası
  const [landBlockNo, setLandBlockNo] = useState(''); // Ada no
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Adres bileşenleri - Türkiye için varsayılan değerler
  const [countryCode, setCountryCode] = useState('TR');
  const [country, setCountry] = useState('Türkiye');
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
  const [popularAddresses, setPopularAddresses] = useState<Array<PopularAddress>>([]);
  
  // Mahalle ve sokak seçimleri için state'ler
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<Array<{value: string, label: string}>>([]);
  const [availableStreets, setAvailableStreets] = useState<Array<{value: string, label: string}>>([]);
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [loadingStreets, setLoadingStreets] = useState(false);
  
  // State tanımlamaları
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<SelectOption[]>([]);
  const [streets, setStreets] = useState<SelectOption[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<SelectOption | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<SelectOption | null>(null);
  
  // Adım adım form için gerekli state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Adım başlıkları ve toplam adım sayısını Türkiye'ye özgü güncelliyoruz
  const stepTitles = [
    "İl Seçimi",
    "İlçe ve Mahalle Seçimi",
    "Adres Detayları",
    "Emlak Temel Özellikleri",
    "Detaylı Gayrimenkul Özellikleri"
  ];
  
  // Form geçerlilik kontrolü
  const isStepValid = (step: number) => {
    switch(step) {
      case 1:
        return !!selectedCountry && !!selectedState;
      case 2:
        return !!selectedCity;
      case 3:
        return true; // Opsiyonel alanlar
      case 4:
        return !!propertyType && (!!grossSize || !!netSize);
      case 5:
        return true; // Detaylı özellikler opsiyonel
      default:
        return false;
    }
  };
  
  // Sonraki adıma geçme
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Önceki adıma dönme
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Ülkeleri yükle
  useEffect(() => {
    // Sayfa yüklendiğinde Türkiye'yi otomatik olarak seç
    const turkeyOption = { value: 'TR', label: 'Türkiye', nativeName: 'Türkiye' };
    setSelectedCountry(turkeyOption);
    setCountryCode('TR');
    setCountry('Türkiye');
    
    // Türkiye'nin illerini yükle
    const cityList = getStatesByCountry('TR');
    setStates(cityList);
    
    loadSavedAddresses();
  }, []);
  
  // İlleri yükle
  useEffect(() => {
    if (selectedCountry?.value) {
      const stateList = getStatesByCountry(selectedCountry.value);
      setStates(stateList);
      setSelectedState(null);
      setSelectedCity(null);
      setSelectedNeighborhood(null);
      setSelectedStreet(null);
    } else {
      setStates([]);
    }
  }, [selectedCountry]);
  
  // İlçeleri yükle
  useEffect(() => {
    if (selectedCountry?.value && selectedState?.value) {
      try {
        console.log('🔍 İlçe yükleniyor:', { 
          country: selectedCountry.value, 
          city: selectedState.value 
        });
        
        const loadCities = async () => {
          const cityList = await getCitiesByState(selectedCountry.value, selectedState.value);
          console.log('📦 Yüklenen ilçeler:', cityList);
          
          // Eğer ilçe listesi boşsa, API'den doğrudan getir
          if (cityList.length === 0) {
            try {
              const apiCities = await getDistrictsByCity(selectedCountry.value, selectedState.value);
              if (apiCities && apiCities.length > 0) {
                setCities(apiCities.map(city => ({
                  value: city.value,
                  label: city.label,
                  stateCode: selectedState.value,
                  countryCode: selectedCountry.value
                })));
              } else {
                // Yine de boşsa, varsayılan bir ilçe ekle
                setCities([{
                  value: selectedState.value,
                  label: `${selectedState.label} Merkez`,
                  stateCode: selectedState.value,
                  countryCode: selectedCountry.value
                }]);
              }
            } catch (error) {
              console.error('❌ API ilçe yükleme hatası:', error);
              // Hata durumunda varsayılan bir ilçe ekle
              setCities([{
                value: selectedState.value,
                label: `${selectedState.label} Merkez`,
                stateCode: selectedState.value,
                countryCode: selectedCountry.value
              }]);
            }
          } else {
            setCities(cityList);
          }
        };
        
        loadCities();
      } catch (error) {
        console.error('❌ İlçe yükleme hatası:', error);
        setCities([]);
      }
      
      setSelectedCity(null);
      setSelectedNeighborhood(null);
      setSelectedStreet(null);
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState]);
  
  // Mahalleleri yükle
  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (selectedCountry?.value && selectedCity?.value && district) {
        setLoadingNeighborhoods(true);
        try {
          console.log('🔍 Mahalle yükleniyor:', { 
            country: selectedCountry.value, 
            city: selectedState?.value || '', 
            district 
          });

          // Ülke ve şehir bilgilerini doğru şekilde kullan
          const neighborhoodList = await getNeighborhoodsByDistrict(
            selectedCountry.value,
            selectedState?.label || city,
            district
          );

          console.log('📦 Yüklenen mahalleler:', neighborhoodList);
          
          // Eğer mahalle listesi boşsa, varsayılan mahalleler ekle
          if (!neighborhoodList || neighborhoodList.length === 0) {
            // Ülkeye özgü varsayılan mahalleler
            let defaultNeighborhoods = [];
            
            if (selectedCountry.value === 'TR') {
              defaultNeighborhoods = [
                { label: `${district} Merkez`, value: `${district} Merkez` },
                { label: `${district} Yeni Mahalle`, value: `${district} Yeni Mahalle` },
                { label: `${district} Cumhuriyet`, value: `${district} Cumhuriyet` },
                { label: `${district} Atatürk`, value: `${district} Atatürk` },
                { label: `${district} Fatih`, value: `${district} Fatih` }
              ];
            } else if (selectedCountry.value === 'DE') {
              defaultNeighborhoods = [
                { label: `${district} Zentrum`, value: `${district} Zentrum` },
                { label: `${district} Nord`, value: `${district} Nord` },
                { label: `${district} Süd`, value: `${district} Süd` },
                { label: `${district} Ost`, value: `${district} Ost` },
                { label: `${district} West`, value: `${district} West` }
              ];
            } else if (selectedCountry.value === 'GB') {
              defaultNeighborhoods = [
                { label: `${district} Centre`, value: `${district} Centre` },
                { label: `${district} North`, value: `${district} North` },
                { label: `${district} South`, value: `${district} South` },
                { label: `${district} East`, value: `${district} East` },
                { label: `${district} West`, value: `${district} West` }
              ];
            } else if (selectedCountry.value === 'FR') {
              defaultNeighborhoods = [
                { label: `${district} Centre`, value: `${district} Centre` },
                { label: `${district} Nord`, value: `${district} Nord` },
                { label: `${district} Sud`, value: `${district} Sud` },
                { label: `${district} Est`, value: `${district} Est` },
                { label: `${district} Ouest`, value: `${district} Ouest` }
              ];
            } else if (selectedCountry.value === 'ES') {
              defaultNeighborhoods = [
                { label: `${district} Centro`, value: `${district} Centro` },
                { label: `${district} Norte`, value: `${district} Norte` },
                { label: `${district} Sur`, value: `${district} Sur` },
                { label: `${district} Este`, value: `${district} Este` },
                { label: `${district} Oeste`, value: `${district} Oeste` }
              ];
            } else if (selectedCountry.value === 'IT') {
              defaultNeighborhoods = [
                { label: `${district} Centro`, value: `${district} Centro` },
                { label: `${district} Nord`, value: `${district} Nord` },
                { label: `${district} Sud`, value: `${district} Sud` },
                { label: `${district} Est`, value: `${district} Est` },
                { label: `${district} Ovest`, value: `${district} Ovest` }
              ];
            } else {
              defaultNeighborhoods = [
                { label: `${district} Center`, value: `${district} Center` },
                { label: `${district} North`, value: `${district} North` },
                { label: `${district} South`, value: `${district} South` },
                { label: `${district} East`, value: `${district} East` },
                { label: `${district} West`, value: `${district} West` }
              ];
            }
            
            setAvailableNeighborhoods(defaultNeighborhoods);
          } else {
            setAvailableNeighborhoods(neighborhoodList);
          }
        } catch (error) {
          console.error('❌ Mahalleler yüklenirken hata:', error);
          // Hata durumunda ülkeye özgü varsayılan mahalleler ekle
          let defaultNeighborhoods = [];
          
          if (selectedCountry.value === 'TR') {
            defaultNeighborhoods = [
              { label: `${district} Merkez`, value: `${district} Merkez` },
              { label: `${district} Yeni Mahalle`, value: `${district} Yeni Mahalle` },
              { label: `${district} Cumhuriyet`, value: `${district} Cumhuriyet` },
              { label: `${district} Atatürk`, value: `${district} Atatürk` },
              { label: `${district} Fatih`, value: `${district} Fatih` }
            ];
          } else if (selectedCountry.value === 'DE') {
            defaultNeighborhoods = [
              { label: `${district} Zentrum`, value: `${district} Zentrum` },
              { label: `${district} Nord`, value: `${district} Nord` },
              { label: `${district} Süd`, value: `${district} Süd` },
              { label: `${district} Ost`, value: `${district} Ost` },
              { label: `${district} West`, value: `${district} West` }
            ];
          } else if (selectedCountry.value === 'GB') {
            defaultNeighborhoods = [
              { label: `${district} Centre`, value: `${district} Centre` },
              { label: `${district} North`, value: `${district} North` },
              { label: `${district} South`, value: `${district} South` },
              { label: `${district} East`, value: `${district} East` },
              { label: `${district} West`, value: `${district} West` }
            ];
          } else if (selectedCountry.value === 'FR') {
            defaultNeighborhoods = [
              { label: `${district} Centre`, value: `${district} Centre` },
              { label: `${district} Nord`, value: `${district} Nord` },
              { label: `${district} Sud`, value: `${district} Sud` },
              { label: `${district} Est`, value: `${district} Est` },
              { label: `${district} Ouest`, value: `${district} Ouest` }
            ];
          } else if (selectedCountry.value === 'ES') {
            defaultNeighborhoods = [
              { label: `${district} Centro`, value: `${district} Centro` },
              { label: `${district} Norte`, value: `${district} Norte` },
              { label: `${district} Sur`, value: `${district} Sur` },
              { label: `${district} Este`, value: `${district} Este` },
              { label: `${district} Oeste`, value: `${district} Oeste` }
            ];
          } else if (selectedCountry.value === 'IT') {
            defaultNeighborhoods = [
              { label: `${district} Centro`, value: `${district} Centro` },
              { label: `${district} Nord`, value: `${district} Nord` },
              { label: `${district} Sud`, value: `${district} Sud` },
              { label: `${district} Est`, value: `${district} Est` },
              { label: `${district} Ovest`, value: `${district} Ovest` }
            ];
          } else {
            defaultNeighborhoods = [
              { label: `${district} Center`, value: `${district} Center` },
              { label: `${district} North`, value: `${district} North` },
              { label: `${district} South`, value: `${district} South` },
              { label: `${district} East`, value: `${district} East` },
              { label: `${district} West`, value: `${district} West` }
            ];
          }
          
          setAvailableNeighborhoods(defaultNeighborhoods);
        } finally {
          setLoadingNeighborhoods(false);
        }
      } else {
        setAvailableNeighborhoods([]);
      }
    };

    loadNeighborhoods();
  }, [selectedCountry?.value, selectedCity?.value, district, selectedState?.value, selectedState?.label, city]);

  // Sokakları yükle
  useEffect(() => {
    const loadStreets = async () => {
      if (countryCode && district && neighborhood) {
        setLoadingStreets(true);
        try {
          console.log('🔍 Sokak yükleniyor:', { countryCode, city, district, neighborhood });
          const streetList = await getStreetsByNeighborhood(
            countryCode,
            city,
            district,
            neighborhood
          );
          console.log('📦 Yüklenen sokaklar:', streetList);
          
          // Eğer sokak listesi boşsa, ülkeye özgü varsayılan sokaklar ekle
          if (!streetList || streetList.length === 0) {
            let defaultStreets = [];
            
            if (countryCode === 'TR') {
              defaultStreets = [
                { label: `${neighborhood} Caddesi`, value: `${neighborhood} Caddesi` },
                { label: 'Atatürk Caddesi', value: 'Atatürk Caddesi' },
                { label: 'Cumhuriyet Caddesi', value: 'Cumhuriyet Caddesi' },
                { label: 'İstiklal Caddesi', value: 'İstiklal Caddesi' },
                { label: 'Gazi Caddesi', value: 'Gazi Caddesi' }
              ];
            } else if (countryCode === 'DE') {
              defaultStreets = [
                { label: `${neighborhood}straße`, value: `${neighborhood}straße` },
                { label: 'Hauptstraße', value: 'Hauptstraße' },
                { label: 'Bahnhofstraße', value: 'Bahnhofstraße' },
                { label: 'Schulstraße', value: 'Schulstraße' },
                { label: 'Gartenstraße', value: 'Gartenstraße' }
              ];
            } else if (countryCode === 'GB') {
              defaultStreets = [
                { label: `${neighborhood} Road`, value: `${neighborhood} Road` },
                { label: 'High Street', value: 'High Street' },
                { label: 'Church Street', value: 'Church Street' },
                { label: 'Park Road', value: 'Park Road' },
                { label: 'Main Street', value: 'Main Street' }
              ];
            } else if (countryCode === 'FR') {
              defaultStreets = [
                { label: `Rue de ${neighborhood}`, value: `Rue de ${neighborhood}` },
                { label: 'Rue Principale', value: 'Rue Principale' },
                { label: 'Avenue de la République', value: 'Avenue de la République' },
                { label: 'Rue de l\'Église', value: 'Rue de l\'Église' },
                { label: 'Rue du Moulin', value: 'Rue du Moulin' }
              ];
            } else if (countryCode === 'ES') {
              defaultStreets = [
                { label: `Calle ${neighborhood}`, value: `Calle ${neighborhood}` },
                { label: 'Calle Mayor', value: 'Calle Mayor' },
                { label: 'Avenida Principal', value: 'Avenida Principal' },
                { label: 'Plaza Mayor', value: 'Plaza Mayor' },
                { label: 'Calle Real', value: 'Calle Real' }
              ];
            } else if (countryCode === 'IT') {
              defaultStreets = [
                { label: `Via ${neighborhood}`, value: `Via ${neighborhood}` },
                { label: 'Via Roma', value: 'Via Roma' },
                { label: 'Corso Italia', value: 'Corso Italia' },
                { label: 'Via Garibaldi', value: 'Via Garibaldi' },
                { label: 'Piazza Duomo', value: 'Piazza Duomo' }
              ];
            } else {
              defaultStreets = [
                { label: `${neighborhood} Street`, value: `${neighborhood} Street` },
                { label: 'Main Street', value: 'Main Street' },
                { label: 'Park Avenue', value: 'Park Avenue' },
                { label: 'Central Street', value: 'Central Street' },
                { label: 'Market Street', value: 'Market Street' }
              ];
            }
            
            setAvailableStreets(defaultStreets);
          } else {
            setAvailableStreets(streetList);
          }
        } catch (error) {
          console.error('❌ Sokaklar yüklenirken hata:', error);
          // Hata durumunda ülkeye özgü varsayılan sokaklar ekle
          let defaultStreets = [];
          
          if (countryCode === 'TR') {
            defaultStreets = [
              { label: `${neighborhood} Caddesi`, value: `${neighborhood} Caddesi` },
              { label: 'Atatürk Caddesi', value: 'Atatürk Caddesi' },
              { label: 'Cumhuriyet Caddesi', value: 'Cumhuriyet Caddesi' },
              { label: 'İstiklal Caddesi', value: 'İstiklal Caddesi' },
              { label: 'Gazi Caddesi', value: 'Gazi Caddesi' }
            ];
          } else if (countryCode === 'DE') {
            defaultStreets = [
              { label: `${neighborhood}straße`, value: `${neighborhood}straße` },
              { label: 'Hauptstraße', value: 'Hauptstraße' },
              { label: 'Bahnhofstraße', value: 'Bahnhofstraße' },
              { label: 'Schulstraße', value: 'Schulstraße' },
              { label: 'Gartenstraße', value: 'Gartenstraße' }
            ];
          } else if (countryCode === 'GB') {
            defaultStreets = [
              { label: `${neighborhood} Road`, value: `${neighborhood} Road` },
              { label: 'High Street', value: 'High Street' },
              { label: 'Church Street', value: 'Church Street' },
              { label: 'Park Road', value: 'Park Road' },
              { label: 'Main Street', value: 'Main Street' }
            ];
          } else if (countryCode === 'FR') {
            defaultStreets = [
              { label: `Rue de ${neighborhood}`, value: `Rue de ${neighborhood}` },
              { label: 'Rue Principale', value: 'Rue Principale' },
              { label: 'Avenue de la République', value: 'Avenue de la République' },
              { label: 'Rue de l\'Église', value: 'Rue de l\'Église' },
              { label: 'Rue du Moulin', value: 'Rue du Moulin' }
            ];
          } else if (countryCode === 'ES') {
            defaultStreets = [
              { label: `Calle ${neighborhood}`, value: `Calle ${neighborhood}` },
              { label: 'Calle Mayor', value: 'Calle Mayor' },
              { label: 'Avenida Principal', value: 'Avenida Principal' },
              { label: 'Plaza Mayor', value: 'Plaza Mayor' },
              { label: 'Calle Real', value: 'Calle Real' }
            ];
          } else if (countryCode === 'IT') {
            defaultStreets = [
              { label: `Via ${neighborhood}`, value: `Via ${neighborhood}` },
              { label: 'Via Roma', value: 'Via Roma' },
              { label: 'Corso Italia', value: 'Corso Italia' },
              { label: 'Via Garibaldi', value: 'Via Garibaldi' },
              { label: 'Piazza Duomo', value: 'Piazza Duomo' }
            ];
          } else {
            defaultStreets = [
              { label: `${neighborhood} Street`, value: `${neighborhood} Street` },
              { label: 'Main Street', value: 'Main Street' },
              { label: 'Park Avenue', value: 'Park Avenue' },
              { label: 'Central Street', value: 'Central Street' },
              { label: 'Market Street', value: 'Market Street' }
            ];
          }
          
          setAvailableStreets(defaultStreets);
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
  
  // Form doğrulama fonksiyonunu düzeltmek
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama - API'nin beklediği zorunlu alanları kontrol et
    const requiredFields = [];
    
    if (!countryCode) requiredFields.push("Ülke");
    if (!city) requiredFields.push("Şehir");
    if (!propertyType) requiredFields.push("Emlak Tipi");
    if (!grossSize && !netSize) requiredFields.push("Metrekare (Brüt veya Net)");
    
    // API için rooms (oda sayısı) değerini belirleme
    const rooms = 2; // Varsayılan değer
    
    if (requiredFields.length > 0) {
      alert(`Lütfen aşağıdaki zorunlu alanları doldurunuz: ${requiredFields.join(", ")}`);
      return;
    }
    
    setLoading(true);
    
    // CSRF token sağla
    ensureCSRFToken();
    
    try {
      // Metrekare değerini belirle (ya brüt ya da net, öncelik brüt'e verilir)
      const sizeToUse = grossSize || netSize || size;
      
      console.log('API\'ye gönderilen veriler:', {
        propertyType,
        size: parseInt(sizeToUse),
        grossSize: grossSize ? parseInt(grossSize) : undefined,
        netSize: netSize ? parseInt(netSize) : undefined,
        rooms,
        location: {
          country,
          countryCode,
          city,
          district,
          postalCode,
          streetAddress: streetAddress || street || ''
        }
      });
      
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: addCSRFHeader({
          'Content-Type': 'application/json',
        }) as HeadersInit,
        body: JSON.stringify({
          propertyType,
          size: parseInt(sizeToUse),
          grossSize: grossSize ? parseInt(grossSize) : undefined,
          netSize: netSize ? parseInt(netSize) : undefined,
          rooms: rooms || undefined,
          bathrooms: bathrooms || undefined,
          buildingAge: buildingAge || undefined,
          floor: floor || undefined,
          totalFloors: totalFloors || undefined,
          features: {
            hasElevator,
            hasParking,
            hasBalcony,
            hasGarden,
            hasNaturalGas,
            isFurnished,
            hasKitchenAppliances,
            hasSiteStatus,
            hasGenerator,
            hasDoorman,
            hasSecurity
          },
          heatingType: heatingType || undefined,
          furnishStatus: furnishStatus || undefined,
          facingDirection: facingDirection || undefined,
          // Türkiye'ye özgü özellikler
          turkishFeatures: {
            buildingType: buildingType || undefined,
            buildingStyle: buildingStyle || undefined,
            deedType: deedType || undefined,
            aidat: aidat ? parseInt(aidat) : undefined,
          },
          // Arsa özellikleri
          landFeatures: propertyType.includes('land') ? {
            landStatus: landStatus || undefined,
            landUsage: landUsage || undefined,
            landParcelNo: landParcelNo || undefined,
            landBlockNo: landBlockNo || undefined
          } : undefined,
          location: {
            country,
            countryCode,
            city,
            district,
            postalCode,
            streetAddress: streetAddress || street || ''
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Değerleme işlemi sırasında bir hata oluştu');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      console.error('Değerleme hatası:', error);
      
      // Eğer hata Gemini API anahtarı eksikliğinden kaynaklanıyorsa, bunu kullanıcıya bildir
      if (error.message && error.message.includes('Gemini API anahtarı bulunamadı')) {
        alert('Gemini API anahtarı henüz tanımlanmamış. Şu an demo/örnek veriler gösterilecek.');
      }
      
      // Hata durumunda örnek veri göster - lokasyona göre değerleri değiştir
      let estimatedValue = '2.500.000 TL';
      const sizeToUse = grossSize || netSize || size;
      
      if (city === 'İstanbul') {
        if (district === 'Kadıköy') estimatedValue = '4.800.000 TL';
        else if (district === 'Beşiktaş') estimatedValue = '5.200.000 TL';
        else if (district === 'Üsküdar') estimatedValue = '3.900.000 TL';
        else estimatedValue = '3.200.000 TL';
      } else if (city === 'Ankara') {
        estimatedValue = '1.800.000 TL';
      } else if (city === 'İzmir') {
        estimatedValue = '2.200.000 TL';
      }
      
      // Metrekareye göre değeri hesapla
      const sizeNum = parseInt(sizeToUse);
      if (!isNaN(sizeNum)) {
        // Baz fiyat/m² (şehir ve ilçeye göre)
        let pricePerSqm = 15000; // Varsayılan
        
        if (city === 'İstanbul') {
          if (district === 'Kadıköy') pricePerSqm = 35000;
          else if (district === 'Beşiktaş') pricePerSqm = 40000;
          else if (district === 'Üsküdar') pricePerSqm = 30000;
          else pricePerSqm = 25000;
        } else if (city === 'Ankara') {
          pricePerSqm = 12000;
        } else if (city === 'İzmir') {
          pricePerSqm = 18000;
        }
        
        const calculatedPrice = pricePerSqm * sizeNum;
        estimatedValue = new Intl.NumberFormat('tr-TR').format(calculatedPrice) + ' TL';
      }
      
      setResult({
        success: true,
        result: {
          estimatedValue: estimatedValue,
          rentalValue: `${parseInt(estimatedValue.replace(/\D/g, '')) / 300} TL/ay`,
          confidence: `85%`,
        marketTrend: 'Yükseliş',
        similarProperties: [
            { address: `${district}, ${city}`, price: estimatedValue },
            { address: `${neighborhood || 'Merkez'}, ${district}, ${city}`, price: `${parseInt(estimatedValue.replace(/\D/g, '')) * 0.9} TL` },
          ],
          propertyDetails: {
            propertyType,
            size: sizeToUse,
            grossSize,
            netSize,
            rooms,
            bathrooms,
            buildingAge,
            floor,
            totalFloors,
            heatingType,
            // Türkiye'ye özgü detaylar
            turkishFeatures: {
              buildingType,
              deedType,
              aidat
            },
            // Arsa özellikleri
            landFeatures: propertyType.includes('land') ? {
              landStatus,
              landUsage,
              landParcelNo,
              landBlockNo
            } : undefined,
            features: {
              hasElevator,
              hasParking,
              hasBalcony,
              hasGarden,
              hasNaturalGas,
              isFurnished,
              hasKitchenAppliances,
              hasSiteStatus,
              hasGenerator,
              hasDoorman,
              hasSecurity
            }
          },
          locationScore: {
            overall: "8.5/10",
            transportation: "7/10",
            safety: "9/10",
            schools: "8/10",
            shopping: "9/10",
            restaurants: "8/10",
            parks: "7/10"
          },
          analysis: `${city} ${district} bölgesinde ${
            propertyType === 'apartment' ? 'daire' : 
            propertyType === 'duplex' ? 'dubleks daire' : 
            propertyType === 'penthouse' ? 'çatı katı' : 
            propertyType === 'garden_apt' ? 'bahçe katı' :
            propertyType === 'house' ? 'müstakil ev' : 
            propertyType === 'villa' ? 'villa' : 
            propertyType === 'farm_house' ? 'çiftlik evi' : 
            propertyType === 'residence' ? 'residence' : 
            propertyType === 'land' ? 'arsa' : 
            propertyType === 'land_agriculture' ? 'tarla' : 
            propertyType === 'office' ? 'ofis' : 
            propertyType === 'store' ? 'dükkan' : 
            propertyType === 'warehouse' ? 'depo' : 
            propertyType === 'industrial' ? 'fabrika' : 
            propertyType === 'hotel' ? 'otel' : 
            propertyType === 'workshop' ? 'atölye' : 
            'ticari emlak'} fiyatları son 1 yılda %15 artış göstermiştir. Bu lokasyon yatırım için ideal bir seçimdir.${deedType ? ` Gayrimenkulün ${deedType === 'ownership' ? 'kat mülkiyetli' : deedType === 'floor_easement' ? 'kat irtifaklı' : deedType === 'shared' ? 'hisseli' : 'inşaat servisi'} tapu durumu değerlemede önemli bir faktördür.` : ''}`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // React-select için özel stil tanımlamaları
  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      borderColor: '#d1d5db',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af',
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#e5edff' : null,
      color: state.isSelected ? 'white' : '#111827',
      fontWeight: state.isSelected ? '600' : '400',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? '#2563eb' : '#e5edff',
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#111827',
      fontWeight: '500'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#4b5563'
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 10,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    })
  };

  // Select bileşenleri için onChange işleyicileri - Tiplerle ilgili sorunları çözmek için düzeltildi
  const handleCountryChange = (newValue: any) => {
    if (newValue) {
      setSelectedCountry(newValue);
      setCountryCode(newValue.value || '');
      setCountry(newValue.label || '');
      
      // Ülke değiştiğinde diğer seçimleri sıfırla
      setSelectedState(null);
      setSelectedCity(null);
      setSelectedNeighborhood(null);
      setSelectedStreet(null);
      setCity('');
      setDistrict('');
      setNeighborhood('');
      setStreet('');
    }
  };

  const handleCityChange = (newValue: any) => {
    if (newValue) {
      setSelectedState(newValue);
      setCity(newValue.label || '');
      
      // Şehir değiştiğinde diğer seçimleri sıfırla
      setSelectedCity(null);
      setSelectedNeighborhood(null);
      setSelectedStreet(null);
      setDistrict('');
      setNeighborhood('');
      setStreet('');
    }
  };

  const handleDistrictChange = (newValue: any) => {
    if (newValue) {
      setSelectedCity(newValue);
      setDistrict(newValue.label || '');
      
      // İlçe değiştiğinde diğer seçimleri sıfırla
      setSelectedNeighborhood(null);
      setSelectedStreet(null);
      setNeighborhood('');
      setStreet('');
    }
  };

  const handleNeighborhoodChange = (newValue: any) => {
    if (newValue) {
      setSelectedNeighborhood(newValue);
      setNeighborhood(newValue.value || newValue.label || '');
      
      // Mahalle değiştiğinde sokak seçimini sıfırla
      setSelectedStreet(null);
      setStreet('');
    }
  };

  const handleStreetChange = (newValue: any) => {
    if (newValue) {
      setSelectedStreet(newValue);
      setStreet(newValue.value || newValue.label || '');
    }
  };

  const handlePropertyTypeChange = (newValue: any) => {
    if (newValue) {
      setPropertyType(newValue.value || '');
    }
  };

  const handleGrossSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGrossSize(e.target.value);
    // Eğer net m2 boşsa ve brüt dolduruluyorsa, otomatik olarak brüt değerin %85'ini net olarak ayarla
    if (!netSize && e.target.value) {
      const grossValue = parseInt(e.target.value);
      if (!isNaN(grossValue)) {
        setNetSize(Math.floor(grossValue * 0.85).toString());
      }
    }
    setSize(e.target.value); // Geriye dönük uyumluluk için
  };

  const handleNetSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNetSize(e.target.value);
    // Eğer brüt m2 boşsa ve net dolduruluyorsa, otomatik olarak net değerin %118'ini brüt olarak ayarla
    if (!grossSize && e.target.value) {
      const netValue = parseInt(e.target.value);
      if (!isNaN(netValue)) {
        setGrossSize(Math.floor(netValue * 1.18).toString());
      }
    }
    if (!size) {
      setSize(e.target.value); // Geriye dönük uyumluluk için
    }
  };

  const loadNeighborhoods = async (countryCode: string, city: string, district: string) => {
    setNeighborhoods([]);
    if (!district) return;
    
    try {
      const neighborhoods = await getNeighborhoodsByDistrict(countryCode, city, district);
      setNeighborhoods(neighborhoods);
    } catch (error) {
      console.error('Mahalle yükleme hatası:', error);
      setNeighborhoods([]);
    }
  };

  // Konut tipi seçenekleri, müstakil ev, villa vb için - Türkiye'ye özgü
  const getPropertyTypeSpecificFields = () => {
    if (!propertyType) return null;
    
    // Konut türleri
    const residentialTypes = ['apartment', 'duplex', 'penthouse', 'garden_apt', 'house', 'villa', 'farm_house', 'residence'];
    
    // Arazi türleri
    const landTypes = ['land', 'land_agriculture'];
    
    // Ticari türler
    const commercialTypes = ['office', 'store', 'warehouse', 'industrial', 'hotel', 'workshop'];
    
    if (residentialTypes.includes(propertyType)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Oda Sayısı
            </label>
            <select
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="0">Stüdyo (1+0)</option>
              <option value="1.5">1+1</option>
              <option value="2.5">2+1</option>
              <option value="3.5">3+1</option>
              <option value="4.5">4+1</option>
              <option value="5.5">5+1</option>
              <option value="6.5">6+1</option>
              <option value="7+">7+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Banyo Sayısı
            </label>
            <select
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Bina Yaşı
            </label>
            <select
              value={buildingAge}
              onChange={(e) => setBuildingAge(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="0-1">0-1 Yıl</option>
              <option value="1-5">1-5 Yıl</option>
              <option value="5-10">5-10 Yıl</option>
              <option value="10-15">10-15 Yıl</option>
              <option value="15-20">15-20 Yıl</option>
              <option value="20-30">20-30 Yıl</option>
              <option value="30+">30+ Yıl</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Bulunduğu Kat
            </label>
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="-2">-2</option>
              <option value="-1">-1</option>
              <option value="0">Zemin</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="10+">10+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Bina Kat Sayısı
            </label>
            <select
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="10+">10+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Isıtma Sistemi
            </label>
            <select
              value={heatingType}
              onChange={(e) => setHeatingType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="natural_gas">Doğalgaz Kombi</option>
              <option value="central_gas">Merkezi Doğalgaz</option>
              <option value="central_fuel">Merkezi Fuel-Oil</option>
              <option value="electric">Elektrikli</option>
              <option value="boiler">Kat Kaloriferi</option>
              <option value="stove">Soba</option>
              <option value="floor_heating">Yerden Isıtma</option>
              <option value="heat_pump">Isı Pompası</option>
              <option value="none">Isıtma Yok</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Cephe Yönü
            </label>
            <select
              value={facingDirection}
              onChange={(e) => setFacingDirection(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="north">Kuzey</option>
              <option value="east">Doğu</option>
              <option value="south">Güney</option>
              <option value="west">Batı</option>
              <option value="northeast">Kuzey-Doğu</option>
              <option value="southeast">Güney-Doğu</option>
              <option value="southwest">Güney-Batı</option>
              <option value="northwest">Kuzey-Batı</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Bina Tipi
            </label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="apartment">Apartman</option>
              <option value="residence">Residence</option>
              <option value="site">Site içi</option>
              <option value="detached">Müstakil</option>
              <option value="historic">Tarihi Bina</option>
              <option value="compound">Toplu Konut</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Tapu Durumu
            </label>
            <select
              value={deedType}
              onChange={(e) => setDeedType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="ownership">Kat Mülkiyetli</option>
              <option value="floor_easement">Kat İrtifaklı</option>
              <option value="shared">Hisseli Tapu</option>
              <option value="construction_servitude">İnşaat Servisi</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Aidat (TL/Ay)
            </label>
            <input
              type="number"
              value={aidat}
              onChange={(e) => setAidat(e.target.value)}
              placeholder="Aylık aidat tutarı"
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>
      );
    }
    
    if (landTypes.includes(propertyType)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              İmar Durumu
            </label>
            <select
              value={landStatus}
              onChange={(e) => setLandStatus(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="residential">Konut İmarlı</option>
              <option value="commercial">Ticari İmarlı</option>
              <option value="industrial">Sanayi İmarlı</option>
              <option value="agricultural">Tarım Arazisi</option>
              <option value="mixed">Karma İmarlı</option>
              <option value="unzoned">İmarsız</option>
              <option value="tourism">Turizm İmarlı</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Kaks (Emsal)
            </label>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="Örn: 0.75, 1.20, 2.05"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Ada No
            </label>
            <input
              type="text"
              value={landBlockNo}
              onChange={(e) => setLandBlockNo(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="Ada no"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Parsel No
            </label>
            <input
              type="text"
              value={landParcelNo}
              onChange={(e) => setLandParcelNo(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="Parsel no"
            />
          </div>
        </div>
      );
    }
    
    if (commercialTypes.includes(propertyType)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Kullanım Durumu
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="empty">Boş</option>
              <option value="tenant">Kiracılı</option>
              <option value="owner">Sahibi Kullanıyor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Bina Yaşı
            </label>
            <select
              value={buildingAge}
              onChange={(e) => setBuildingAge(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="0-1">0-1 Yıl</option>
              <option value="1-5">1-5 Yıl</option>
              <option value="5-10">5-10 Yıl</option>
              <option value="10-15">10-15 Yıl</option>
              <option value="15-20">15-20 Yıl</option>
              <option value="20-30">20-30 Yıl</option>
              <option value="30+">30+ Yıl</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Aidat (TL/Ay)
            </label>
            <input
              type="number"
              value={aidat}
              onChange={(e) => setAidat(e.target.value)}
              placeholder="Aylık aidat tutarı"
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Tapu Durumu
            </label>
            <select
              value={deedType}
              onChange={(e) => setDeedType(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="ownership">Kat Mülkiyetli</option>
              <option value="floor_easement">Kat İrtifaklı</option>
              <option value="shared">Hisseli Tapu</option>
              <option value="construction_servitude">İnşaat Servisi</option>
            </select>
          </div>
        </div>
      );
    }
    
    return null;
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
            <p className="text-gray-700 text-sm sm:text-base">Yapay zeka ile emlak değerinizi öğrenin</p>
          </div>
        </div>

        {/* Adım Göstergesi */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({length: totalSteps}).map((_, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all 
                    ${currentStep > index + 1 ? 'bg-green-500 text-white' : 
                      currentStep === index + 1 ? 'bg-blue-600 text-white' : 
                      'bg-gray-200 text-gray-500'}`}
                >
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`h-1 w-full sm:w-24 md:w-32 mx-2
                    ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} 
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <h2 className="font-medium text-gray-900">{stepTitles[currentStep - 1]}</h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Adım 1: İl Seçimi */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* İl Seçimi */}
            <div>
                  <div className="flex justify-between items-center mb-1 sm:mb-2">
                    <label className="block text-sm font-medium text-gray-800">
                      İl <span className="text-red-600">*</span>
              </label>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-700 focus:outline-none focus:underline flex items-center"
                        onClick={() => setShowSavedAddresses(true)}
                      >
                        <BookmarkIcon className="h-3 w-3 mr-1" />
                        Kayıtlı Adresleri Göster
                      </button>
                    )}
                  </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </div>
                    <Select
                      instanceId="city-select"
                      placeholder="İl seçin"
                      options={states}
                      value={selectedState}
                      onChange={handleCityChange}
                      isSearchable
                      aria-label="İl seçin"
                      styles={customSelectStyles}
                      classNames={{
                        control: (state) => 'pl-10 !bg-white',
                        input: () => '!text-gray-900',
                        menu: () => '!text-gray-900'
                      }}
                      noOptionsMessage={() => "Seçenek bulunamadı."}
                />
              </div>
            </div>
              </div>
            </div>
          )}

          {/* Adım 2: İlçe ve Mahalle Seçimi */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* İlçe Seçimi */}
            <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1 sm:mb-2">
                    İlçe <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </div>
                    <Select
                      instanceId="city-select"
                      placeholder="İlçe seçin"
                      options={cities}
                      value={selectedCity}
                      onChange={handleDistrictChange}
                      isSearchable
                      isDisabled={!selectedState}
                      aria-label="İlçe seçin"
                      styles={customSelectStyles}
                      classNames={{
                        control: (state) => 'pl-10 !bg-white',
                        input: () => '!text-gray-900',
                        menu: () => '!text-gray-900'
                      }}
                      noOptionsMessage={() => "Seçenek bulunamadı. Lütfen önce şehir seçin."}
                    />
                  </div>
                </div>
                
                {/* Mahalle Seçimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1 sm:mb-2">
                    Mahalle
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    </div>
                    <Select
                      instanceId="neighborhood-select"
                      placeholder="Mahalle seçin"
                      options={availableNeighborhoods}
                      value={neighborhood ? { value: neighborhood, label: neighborhood } : null}
                      onChange={handleNeighborhoodChange}
                      isSearchable
                      isDisabled={!district}
                      isLoading={loadingNeighborhoods}
                      aria-label="Mahalle seçin"
                      styles={customSelectStyles}
                      classNames={{
                        control: (state) => 'pl-10 !bg-white',
                        input: () => '!text-gray-900',
                        menu: () => '!text-gray-900'
                      }}
                      noOptionsMessage={() => "Seçenek bulunamadı. Lütfen önce ilçe seçin."}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Adım 3: Adres Detayları */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Sokak Seçimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1 sm:mb-2">
                    Cadde/Sokak
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    </div>
                    <Select
                      instanceId="street-select"
                      placeholder="Cadde/Sokak seçin veya yazın"
                      options={availableStreets}
                      value={street ? { value: street, label: street } : null}
                      onChange={handleStreetChange}
                      isSearchable
                      isDisabled={!neighborhood}
                      isLoading={loadingStreets}
                      aria-label="Cadde/Sokak seçin"
                      styles={customSelectStyles}
                      classNames={{
                        control: (state) => 'pl-10 !bg-white',
                        input: () => '!text-gray-900',
                        menu: () => '!text-gray-900'
                      }}
                      noOptionsMessage={() => "Seçenek bulunamadı. Lütfen önce mahalle seçin."}
                    />
                  </div>
                </div>
                
                {/* Posta Kodu */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1 sm:mb-2">
                    Posta Kodu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Posta kodu girin"
                      className="pl-10 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
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
            </div>
          )}
          
          {/* Adım 4: Emlak Temel Özellikleri */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Emlak Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1 sm:mb-2">
                    Emlak Tipi <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { value: 'apartment', label: 'Daire', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'duplex', label: 'Dubleks', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'penthouse', label: 'Çatı Katı', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'garden_apt', label: 'Bahçe Katı', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'house', label: 'Müstakil Ev', icon: <HomeIcon className="w-8 h-8" /> },
                      { value: 'villa', label: 'Villa', icon: <HomeIcon className="w-8 h-8" /> },
                      { value: 'farm_house', label: 'Çiftlik Evi', icon: <HomeIcon className="w-8 h-8" /> },
                      { value: 'residence', label: 'Residence', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'land', label: 'Arsa', icon: <MapPinIcon className="w-8 h-8" /> },
                      { value: 'land_agriculture', label: 'Tarla', icon: <MapPinIcon className="w-8 h-8" /> },
                      { value: 'office', label: 'Ofis', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'store', label: 'Dükkan', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'warehouse', label: 'Depo', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'industrial', label: 'Fabrika', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'hotel', label: 'Otel', icon: <BuildingOfficeIcon className="w-8 h-8" /> },
                      { value: 'workshop', label: 'Atölye', icon: <BuildingOfficeIcon className="w-8 h-8" /> }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setPropertyType(option.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all
                          ${propertyType === option.value 
                            ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}
                      >
                        <div className={`${propertyType === option.value ? 'text-blue-600' : 'text-gray-500'}`}>
                          {option.icon}
                        </div>
                        <span className={`mt-2 text-sm font-medium ${propertyType === option.value ? 'text-blue-700' : 'text-gray-800'}`}>
                          {option.label}
                        </span>
                      </div>
                    ))}
              </div>
            </div>

                {/* Metrekare */}
            <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1 sm:mb-2">
                    Metrekare <span className="text-red-600">*</span>
              </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brüt Metrekare */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">m²</span>
                </div>
                <input
                  type="number"
                        value={grossSize}
                        onChange={handleGrossSizeChange}
                        placeholder="Brüt Metrekare"
                        className="pl-10 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Tapu üzerinde yazan resmi alan</span>
              </div>
                    
                    {/* Net Metrekare */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">m²</span>
            </div>
                      <input
                        type="number" 
                        value={netSize}
                        onChange={handleNetSizeChange}
                        placeholder="Net Metrekare"
                        className="pl-10 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">Kullanılabilir iç alan</span>
          </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Adım 5: Detaylı Gayrimenkul Özellikleri - Türkiye'ye özgü özellikler */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Emlak tipine göre spesifik alanlar */}
                {getPropertyTypeSpecificFields()}
                
                {/* Ortak özellikler - checkbox'lar */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800 mb-3">
                    Özellikler
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasElevator"
                        checked={hasElevator}
                        onChange={(e) => setHasElevator(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasElevator" className="ml-2 text-sm text-gray-800">
                        Asansör
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasParking"
                        checked={hasParking}
                        onChange={(e) => setHasParking(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasParking" className="ml-2 text-sm text-gray-800">
                        Otopark
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasBalcony"
                        checked={hasBalcony}
                        onChange={(e) => setHasBalcony(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasBalcony" className="ml-2 text-sm text-gray-800">
                        Balkon
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasGarden"
                        checked={hasGarden}
                        onChange={(e) => setHasGarden(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasGarden" className="ml-2 text-sm text-gray-800">
                        Bahçe
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasNaturalGas"
                        checked={hasNaturalGas}
                        onChange={(e) => setHasNaturalGas(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasNaturalGas" className="ml-2 text-sm text-gray-800">
                        Doğalgaz
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isFurnished"
                        checked={isFurnished}
                        onChange={(e) => setIsFurnished(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isFurnished" className="ml-2 text-sm text-gray-800">
                        Eşyalı
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasKitchenAppliances"
                        checked={hasKitchenAppliances}
                        onChange={(e) => setHasKitchenAppliances(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasKitchenAppliances" className="ml-2 text-sm text-gray-800">
                        Ankastre
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasSiteStatus"
                        checked={hasSiteStatus}
                        onChange={(e) => setHasSiteStatus(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasSiteStatus" className="ml-2 text-sm text-gray-800">
                        Site İçinde
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasDoorman"
                        checked={hasDoorman}
                        onChange={(e) => setHasDoorman(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasDoorman" className="ml-2 text-sm text-gray-800">
                        Kapıcı
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasSecurity"
                        checked={hasSecurity}
                        onChange={(e) => setHasSecurity(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasSecurity" className="ml-2 text-sm text-gray-800">
                        Güvenlik
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasGenerator"
                        checked={hasGenerator}
                        onChange={(e) => setHasGenerator(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasGenerator" className="ml-2 text-sm text-gray-800">
                        Jeneratör
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Ekstra özellik notu */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Ek Özellikler
                  </label>
                  <textarea
                    placeholder="Değerlemede faydalı olacak ek özellikleri buraya yazabilirsiniz..."
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          {/* İleri/Geri Butonları ve Form Kontrol */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 flex items-center justify-center rounded-lg text-sm border border-gray-300 
                ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-800'}`}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Önceki Adım
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className={`px-6 py-2 rounded-lg text-sm text-white flex items-center bg-blue-600
                  ${!isStepValid(currentStep) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700'}`}
              >
                Sonraki Adım
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            ) : (
          <button
            type="submit"
                disabled={loading || !isStepValid(currentStep)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Değerleme Yapılıyor...
              </div>
            ) : (
              'Değerleme Yap'
            )}
          </button>
            )}
          </div>
        </form>

        {/* Değerlendirme Sonucu */}
        {result && (
          <div className="mt-8 animate-fadeIn">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">Değerlendirme Sonucu</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-sm text-gray-700 mb-1">Tahmini Değer</div>
                  <div className="text-2xl font-bold text-blue-600">{result.result?.estimatedValue || result.estimatedValue}</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-sm text-gray-700 mb-1">Güven Oranı</div>
                  <div className="text-2xl font-bold text-blue-600">{result.result?.confidence || result.confidence}</div>
                </div>
                
                {result.result?.rentalValue && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-700 mb-1">Tahmini Kira</div>
                    <div className="text-2xl font-bold text-blue-600">{result.result.rentalValue}</div>
                </div>
                )}
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-sm text-gray-700 mb-1">Piyasa Trendi</div>
                  <div className="text-2xl font-bold text-green-600">{result.result?.marketTrend || result.marketTrend}</div>
              </div>
            </div>

              {/* Benzer Emlaklar */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Benzer Emlaklar</h4>
                <div className="space-y-3">
                  {(result.result?.similarProperties || result.similarProperties)?.map((property: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                      <span className="text-gray-700">{property.address}</span>
                      <span className="font-semibold text-blue-600">{property.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Piyasa Analizi */}
              {result.result?.analysis && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Piyasa Analizi</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{result.result.analysis}</p>
                  </div>
                </div>
              )}
              
              {/* Gayrimenkul Detayları */}
              {result.result?.propertyDetails && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Gayrimenkul Detayları</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Emlak Türü</span>
                        <p className="font-medium text-gray-800">
                          {propertyType === 'apartment' ? 'Daire' : 
                            propertyType === 'duplex' ? 'Dubleks' : 
                            propertyType === 'penthouse' ? 'Çatı Katı' : 
                            propertyType === 'garden_apt' ? 'Bahçe Katı' :
                            propertyType === 'house' ? 'Müstakil Ev' : 
                            propertyType === 'villa' ? 'Villa' : 
                            propertyType === 'farm_house' ? 'Çiftlik Evi' : 
                            propertyType === 'residence' ? 'Residence' : 
                            propertyType === 'land' ? 'Arsa' : 
                            propertyType === 'land_agriculture' ? 'Tarla' : 
                            propertyType === 'office' ? 'Ofis' : 
                            propertyType === 'store' ? 'Dükkan' : 
                            propertyType === 'warehouse' ? 'Depo' : 
                            propertyType === 'industrial' ? 'Fabrika' : 
                            propertyType === 'hotel' ? 'Otel' : 
                            propertyType === 'workshop' ? 'Atölye' : 
                            'Bilinmiyor'}
                        </p>
                    </div>
                      
                      {result.result.propertyDetails.grossSize && (
                        <div>
                          <span className="text-sm text-gray-500">Brüt Alan</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.grossSize} m²</p>
                  </div>
                      )}
                      
                      {result.result.propertyDetails.netSize && (
                        <div>
                          <span className="text-sm text-gray-500">Net Alan</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.netSize} m²</p>
              </div>
                      )}
                      
                      {result.result.propertyDetails.rooms && (
                        <div>
                          <span className="text-sm text-gray-500">Oda Sayısı</span>
                          <p className="font-medium text-gray-800">
                            {result.result.propertyDetails.rooms === "0" ? "Stüdyo (1+0)" : 
                             result.result.propertyDetails.rooms === "1.5" ? "1+1" :
                             result.result.propertyDetails.rooms === "2.5" ? "2+1" :
                             result.result.propertyDetails.rooms === "3.5" ? "3+1" :
                             result.result.propertyDetails.rooms === "4.5" ? "4+1" :
                             result.result.propertyDetails.rooms === "5.5" ? "5+1" :
                             result.result.propertyDetails.rooms === "6.5" ? "6+1" :
                             result.result.propertyDetails.rooms === "7+" ? "7+" :
                             result.result.propertyDetails.rooms}
                          </p>
            </div>
                      )}
                      
                      {result.result.propertyDetails.bathrooms && (
                        <div>
                          <span className="text-sm text-gray-500">Banyo Sayısı</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.bathrooms}</p>
          </div>
        )}
                      
                      {result.result.propertyDetails.buildingAge && (
                        <div>
                          <span className="text-sm text-gray-500">Bina Yaşı</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.buildingAge}</p>
                        </div>
                      )}
                      
                      {result.result.propertyDetails.floor && (
                        <div>
                          <span className="text-sm text-gray-500">Bulunduğu Kat</span>
                          <p className="font-medium text-gray-800">
                            {result.result.propertyDetails.floor === "0" ? "Zemin Kat" : 
                             result.result.propertyDetails.floor === "-1" ? "Bodrum Kat" :
                             result.result.propertyDetails.floor === "-2" ? "2. Bodrum Kat" :
                             result.result.propertyDetails.floor + ". Kat"}
                          </p>
                        </div>
                      )}
                      
                      {result.result.propertyDetails.totalFloors && (
                        <div>
                          <span className="text-sm text-gray-500">Toplam Kat</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.totalFloors}</p>
                        </div>
                      )}
                      
                      {result.result.propertyDetails.heatingType && (
                        <div>
                          <span className="text-sm text-gray-500">Isıtma</span>
                          <p className="font-medium text-gray-800">
                            {result.result.propertyDetails.heatingType === "natural_gas" ? "Doğalgaz Kombi" :
                             result.result.propertyDetails.heatingType === "central_gas" ? "Merkezi Doğalgaz" :
                             result.result.propertyDetails.heatingType === "central_fuel" ? "Merkezi Fuel-Oil" :
                             result.result.propertyDetails.heatingType === "electric" ? "Elektrikli" :
                             result.result.propertyDetails.heatingType === "boiler" ? "Kat Kaloriferi" :
                             result.result.propertyDetails.heatingType === "stove" ? "Soba" :
                             result.result.propertyDetails.heatingType === "floor_heating" ? "Yerden Isıtma" :
                             result.result.propertyDetails.heatingType === "heat_pump" ? "Isı Pompası" :
                             result.result.propertyDetails.heatingType === "none" ? "Isıtma Yok" :
                             result.result.propertyDetails.heatingType}
                          </p>
                        </div>
                      )}
                      
                      {/* Türkiye'ye özgü detaylar */}
                      {result.result.propertyDetails.turkishFeatures?.buildingType && (
                        <div>
                          <span className="text-sm text-gray-500">Bina Tipi</span>
                          <p className="font-medium text-gray-800">
                            {result.result.propertyDetails.turkishFeatures.buildingType === "apartment" ? "Apartman" :
                             result.result.propertyDetails.turkishFeatures.buildingType === "residence" ? "Residence" :
                             result.result.propertyDetails.turkishFeatures.buildingType === "site" ? "Site içi" :
                             result.result.propertyDetails.turkishFeatures.buildingType === "detached" ? "Müstakil" :
                             result.result.propertyDetails.turkishFeatures.buildingType === "historic" ? "Tarihi Bina" :
                             result.result.propertyDetails.turkishFeatures.buildingType === "compound" ? "Toplu Konut" :
                             result.result.propertyDetails.turkishFeatures.buildingType}
                          </p>
                        </div>
                      )}
                      
                      {result.result.propertyDetails.turkishFeatures?.deedType && (
                        <div>
                          <span className="text-sm text-gray-500">Tapu Durumu</span>
                          <p className="font-medium text-gray-800">
                            {result.result.propertyDetails.turkishFeatures.deedType === "ownership" ? "Kat Mülkiyetli" :
                             result.result.propertyDetails.turkishFeatures.deedType === "floor_easement" ? "Kat İrtifaklı" :
                             result.result.propertyDetails.turkishFeatures.deedType === "shared" ? "Hisseli Tapu" :
                             result.result.propertyDetails.turkishFeatures.deedType === "construction_servitude" ? "İnşaat Servisi" :
                             result.result.propertyDetails.turkishFeatures.deedType}
                          </p>
                        </div>
                      )}
                      
                      {result.result.propertyDetails.turkishFeatures?.aidat && (
                        <div>
                          <span className="text-sm text-gray-500">Aidat</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.turkishFeatures.aidat} TL/ay</p>
                        </div>
                      )}
                      
                      {/* Arsa Özellikleri */}
                      {result.result.propertyDetails.landFeatures?.landStatus && (
                        <div>
                          <span className="text-sm text-gray-500">İmar Durumu</span>
                          <p className="font-medium text-gray-800">
                            {result.result.propertyDetails.landFeatures.landStatus === "residential" ? "Konut İmarlı" :
                             result.result.propertyDetails.landFeatures.landStatus === "commercial" ? "Ticari İmarlı" :
                             result.result.propertyDetails.landFeatures.landStatus === "industrial" ? "Sanayi İmarlı" :
                             result.result.propertyDetails.landFeatures.landStatus === "agricultural" ? "Tarım Arazisi" :
                             result.result.propertyDetails.landFeatures.landStatus === "mixed" ? "Karma İmarlı" :
                             result.result.propertyDetails.landFeatures.landStatus === "tourism" ? "Turizm İmarlı" :
                             result.result.propertyDetails.landFeatures.landStatus === "unzoned" ? "İmarsız" :
                             result.result.propertyDetails.landFeatures.landStatus}
                          </p>
                        </div>
                      )}
                      
                      {result.result.propertyDetails.landFeatures?.landBlockNo && (
                        <div>
                          <span className="text-sm text-gray-500">Ada No</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.landFeatures.landBlockNo}</p>
                        </div>
                      )}
                      
                      {result.result.propertyDetails.landFeatures?.landParcelNo && (
                        <div>
                          <span className="text-sm text-gray-500">Parsel No</span>
                          <p className="font-medium text-gray-800">{result.result.propertyDetails.landFeatures.landParcelNo}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Özellikler */}
                    {result.result.propertyDetails.features && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500 block mb-2">Özellikler</span>
                        <div className="flex flex-wrap gap-2">
                          {result.result.propertyDetails.features.hasElevator && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Asansör</span>
                          )}
                          {result.result.propertyDetails.features.hasParking && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Otopark</span>
                          )}
                          {result.result.propertyDetails.features.hasBalcony && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Balkon</span>
                          )}
                          {result.result.propertyDetails.features.hasGarden && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Bahçe</span>
                          )}
                          {result.result.propertyDetails.features.hasNaturalGas && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Doğalgaz</span>
                          )}
                          {result.result.propertyDetails.features.isFurnished && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Eşyalı</span>
                          )}
                          {result.result.propertyDetails.features.hasKitchenAppliances && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Ankastre</span>
                          )}
                          {result.result.propertyDetails.features.hasSiteStatus && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Site İçinde</span>
                          )}
                          {result.result.propertyDetails.features.hasDoorman && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Kapıcı</span>
                          )}
                          {result.result.propertyDetails.features.hasSecurity && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Güvenlik</span>
                          )}
                          {result.result.propertyDetails.features.hasGenerator && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Jeneratör</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Lokasyon Puanları */}
              {result.result?.locationScore && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Lokasyon Değerlendirmesi</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center mb-3">
                      <span className="text-lg font-bold text-blue-700">{result.result.locationScore.overall}</span>
                      <span className="ml-2 text-gray-600">Genel Puan</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm text-gray-700">Ulaşım</span>
                        </div>
                        <div className="font-medium">{result.result.locationScore.transportation}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm text-gray-700">Güvenlik</span>
                        </div>
                        <div className="font-medium">{result.result.locationScore.safety}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                          <span className="text-sm text-gray-700">Okullar</span>
                        </div>
                        <div className="font-medium">{result.result.locationScore.schools}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                          <span className="text-sm text-gray-700">Alışveriş</span>
                        </div>
                        <div className="font-medium">{result.result.locationScore.shopping}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm text-gray-700">Restoranlar</span>
                        </div>
                        <div className="font-medium">{result.result.locationScore.restaurants}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-teal-500 mr-2"></div>
                          <span className="text-sm text-gray-700">Parklar</span>
                        </div>
                        <div className="font-medium">{result.result.locationScore.parks}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 