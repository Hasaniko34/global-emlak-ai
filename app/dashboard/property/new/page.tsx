'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

// Form girişleri için ilk değerler
const initialFormState = {
  title: '',
  description: '',
  propertyType: 'apartment',
  address: '',
  city: '',
  district: '',
  size: '',
  rooms: '',
  bathrooms: '',
  yearBuilt: '',
  heating: '',
  price: '',
  currency: 'TL',
  status: 'active',
  monthlyIncome: '0',
  monthlyExpenses: '0'
};

// Form doğrulama için tür
interface FormErrors {
  title?: string;
  description?: string;
  propertyType?: string;
  address?: string;
  city?: string;
  district?: string;
  size?: string;
  rooms?: string;
  bathrooms?: string;
  yearBuilt?: string;
  price?: string;
  currency?: string;
  monthlyIncome?: string;
  monthlyExpenses?: string;
}

export default function NewPropertyPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form girişlerini güncelleme
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Field dokunuldu olarak işaretle
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
  };
  
  // Field blur olduğunda doğrulama
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };
  
  // Form doğrulama
  useEffect(() => {
    const errors: FormErrors = {};
    
    // Doğrulama kuralları
    if (touchedFields.title && !formData.title.trim()) {
      errors.title = 'Başlık zorunludur';
    }
    
    if (touchedFields.address && !formData.address.trim()) {
      errors.address = 'Adres zorunludur';
    }
    
    if (touchedFields.city && !formData.city.trim()) {
      errors.city = 'Şehir zorunludur';
    }
    
    if (touchedFields.district && !formData.district.trim()) {
      errors.district = 'İlçe zorunludur';
    }
    
    if (touchedFields.size) {
      if (!formData.size) {
        errors.size = 'Metrekare zorunludur';
      } else if (Number(formData.size) <= 0) {
        errors.size = 'Geçerli bir metrekare giriniz';
      }
    }
    
    if (touchedFields.price) {
      if (!formData.price) {
        errors.price = 'Fiyat zorunludur';
      } else if (Number(formData.price) <= 0) {
        errors.price = 'Geçerli bir fiyat giriniz';
      }
    }
    
    if (touchedFields.monthlyIncome && Number(formData.monthlyIncome) < 0) {
      errors.monthlyIncome = 'Aylık gelir negatif olamaz';
    }
    
    if (touchedFields.monthlyExpenses && Number(formData.monthlyExpenses) < 0) {
      errors.monthlyExpenses = 'Aylık gider negatif olamaz';
    }
    
    if (touchedFields.yearBuilt) {
      const year = Number(formData.yearBuilt);
      const currentYear = new Date().getFullYear();
      if (year && (year < 1800 || year > currentYear)) {
        errors.yearBuilt = `Yapım yılı 1800 ile ${currentYear} arasında olmalıdır`;
      }
    }
    
    setFormErrors(errors);
  }, [formData, touchedFields]);
  
  // Tüm formu doğrulama
  const validateForm = () => {
    // Tüm alanları dokunulmuş olarak işaretle
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouchedFields(allTouched);
    
    // Doğrulama yap
    const errors: FormErrors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Başlık zorunludur';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Adres zorunludur';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'Şehir zorunludur';
    }
    
    if (!formData.district.trim()) {
      errors.district = 'İlçe zorunludur';
    }
    
    if (!formData.size) {
      errors.size = 'Metrekare zorunludur';
    } else if (Number(formData.size) <= 0) {
      errors.size = 'Geçerli bir metrekare giriniz';
    }
    
    if (!formData.price) {
      errors.price = 'Fiyat zorunludur';
    } else if (Number(formData.price) <= 0) {
      errors.price = 'Geçerli bir fiyat giriniz';
    }
    
    if (Number(formData.monthlyIncome) < 0) {
      errors.monthlyIncome = 'Aylık gelir negatif olamaz';
    }
    
    if (Number(formData.monthlyExpenses) < 0) {
      errors.monthlyExpenses = 'Aylık gider negatif olamaz';
    }
    
    if (formData.yearBuilt) {
      const year = Number(formData.yearBuilt);
      const currentYear = new Date().getFullYear();
      if (year < 1800 || year > currentYear) {
        errors.yearBuilt = `Yapım yılı 1800 ile ${currentYear} arasında olmalıdır`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Resim ekleme
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Resimleri kontrol et
    const validFiles = newFiles.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        setError('Lütfen sadece resim dosyaları yükleyin.');
      }
      
      // Dosya boyutu kontrolü (10MB maksimum)
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (file.size > maxSize) {
        setError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
        return false;
      }
      
      return isValid;
    });
    
    if (validFiles.length === 0) return;
    
    // Maksimum 5 resim kontrolü
    if (images.length + validFiles.length > 5) {
      setError('En fazla 5 resim yükleyebilirsiniz.');
      return;
    }
    
    setImages(prev => [...prev, ...validFiles]);
    
    // Önizleme URL'leri oluştur
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Hata varsa temizle
    setError(null);
    
    // Input değerini sıfırla
    e.target.value = '';
  };
  
  // Resim kaldırma
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Önizleme URL'sini temizle
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulamasını kontrol et
    if (!validateForm()) {
      // Sayfayı ilk hataya kaydır
      const firstErrorEl = document.querySelector('.error-message');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Gayrimenkul verilerini kaydet
      const propertyResponse = await fetch('/api/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          propertyType: formData.propertyType,
          location: {
            address: formData.address,
            city: formData.city,
            district: formData.district,
          },
          features: {
            size: Number(formData.size),
            rooms: formData.rooms ? Number(formData.rooms) : undefined,
            bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
            yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
            heating: formData.heating || undefined,
          },
          price: Number(formData.price),
          currency: formData.currency,
          status: formData.status,
          financials: {
            currentValue: Number(formData.price), // Başlangıçta fiyat ile aynı
            monthlyIncome: Number(formData.monthlyIncome) || 0,
            monthlyExpenses: Number(formData.monthlyExpenses) || 0,
          },
        }),
      });
      
      if (!propertyResponse.ok) {
        const errorData = await propertyResponse.json();
        throw new Error(errorData.error || 'Gayrimenkul kaydedilirken bir hata oluştu');
      }
      
      const propertyData = await propertyResponse.json();
      
      // Eğer resim varsa, resimleri yükle
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });
        formData.append('propertyId', propertyData.property._id);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Resimler yüklenirken bir hata oluştu');
        }
      }
      
      // Başarılı olduğunda bildirimi göster
      setSubmitSuccess(true);
      
      // 2 saniye sonra yönlendir
      setTimeout(() => {
        router.push(`/dashboard/property/${propertyData.property._id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Gayrimenkul kaydedilirken bir hata oluştu');
      
      // Sayfayı hata mesajına doğru kaydır
      const errorEl = document.getElementById('error-message');
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Formun değiştirildiğini takip et
  const isFormChanged = () => {
    return Object.keys(formData).some(key => {
      const initialValue = initialFormState[key as keyof typeof initialFormState];
      const currentValue = formData[key as keyof typeof formData];
      return initialValue !== currentValue;
    }) || images.length > 0;
  };
  
  // Sayfa değiştirildiğinde uyarı göster
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormChanged()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, images]);
  
  // Field hata gösteren bileşen
  const FormFieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="mt-1 text-sm text-red-600 flex items-center error-message">
        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
        {error}
      </div>
    );
  };
  
  // Başarı mesajı
  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Gayrimenkul Başarıyla Kaydedildi!</h2>
          <p className="text-green-600 mb-4">Gayrimenkul detaylarına yönlendiriliyorsunuz...</p>
          <div className="w-full max-w-xs mx-auto bg-green-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/dashboard/property" 
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Gayrimenkullere Dön
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Yeni Gayrimenkul Ekle</h1>
      </div>
      
      {error && (
        <div id="error-message" className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Başlık <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Bahçeli Müstakil Ev"
            />
            <FormFieldError error={formErrors.title} />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Gayrimenkulün özellikleri hakkında detaylı bilgi..."
            />
          </div>
          
          <div>
            <label htmlFor="propertyType" className="block text-gray-700 font-medium mb-2">
              Gayrimenkul Tipi <span className="text-red-600">*</span>
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="apartment">Daire</option>
              <option value="house">Müstakil Ev</option>
              <option value="land">Arsa</option>
              <option value="commercial">Ticari</option>
              <option value="other">Diğer</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-gray-700 font-medium mb-2">
              Durum <span className="text-red-600">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktif</option>
              <option value="sold">Satılmış</option>
              <option value="rented">Kiralık</option>
            </select>
          </div>
          
          <h2 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-4">
            Konum Bilgileri
          </h2>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
              Adres <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Atatürk Mahallesi, Millet Caddesi No:15 Daire:4"
            />
            <FormFieldError error={formErrors.address} />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
              Şehir <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: İstanbul"
            />
            <FormFieldError error={formErrors.city} />
          </div>
          
          <div>
            <label htmlFor="district" className="block text-gray-700 font-medium mb-2">
              İlçe <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.district ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: Kadıköy"
            />
            <FormFieldError error={formErrors.district} />
          </div>
          
          <h2 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-4">
            Emlak Özellikleri
          </h2>
          
          <div>
            <label htmlFor="size" className="block text-gray-700 font-medium mb-2">
              Metrekare <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.size ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 120"
              min="0"
            />
            <FormFieldError error={formErrors.size} />
          </div>
          
          <div>
            <label htmlFor="yearBuilt" className="block text-gray-700 font-medium mb-2">
              Yapım Yılı
            </label>
            <input
              type="number"
              id="yearBuilt"
              name="yearBuilt"
              value={formData.yearBuilt}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.yearBuilt ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 2015"
            />
            <FormFieldError error={formErrors.yearBuilt} />
          </div>
          
          <div>
            <label htmlFor="rooms" className="block text-gray-700 font-medium mb-2">
              Oda Sayısı
            </label>
            <input
              type="number"
              id="rooms"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: 3"
              min="0"
            />
          </div>
          
          <div>
            <label htmlFor="bathrooms" className="block text-gray-700 font-medium mb-2">
              Banyo Sayısı
            </label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: 2"
              min="0"
            />
          </div>
          
          <div>
            <label htmlFor="heating" className="block text-gray-700 font-medium mb-2">
              Isıtma Tipi
            </label>
            <input
              type="text"
              id="heating"
              name="heating"
              value={formData.heating}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Merkezi Doğalgaz"
            />
          </div>
          
          <h2 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-4">
            Fiyat Bilgileri
          </h2>
          
          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
              Fiyat <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 1500000"
              min="0"
            />
            <FormFieldError error={formErrors.price} />
          </div>
          
          <div>
            <label htmlFor="currency" className="block text-gray-700 font-medium mb-2">
              Para Birimi <span className="text-red-600">*</span>
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TL">TL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="monthlyIncome" className="block text-gray-700 font-medium mb-2">
              Aylık Gelir
            </label>
            <input
              type="number"
              id="monthlyIncome"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.monthlyIncome ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 8000"
              min="0"
            />
            <FormFieldError error={formErrors.monthlyIncome} />
          </div>
          
          <div>
            <label htmlFor="monthlyExpenses" className="block text-gray-700 font-medium mb-2">
              Aylık Gider
            </label>
            <input
              type="number"
              id="monthlyExpenses"
              name="monthlyExpenses"
              value={formData.monthlyExpenses}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.monthlyExpenses ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: 1000"
              min="0"
            />
            <FormFieldError error={formErrors.monthlyExpenses} />
          </div>
          
          <h2 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-4">
            Resimler
          </h2>
          
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-32 h-32">
                  <img 
                    src={url} 
                    alt={`Resim ${index + 1}`} 
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {previewUrls.length < 5 && (
                <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-2">Resim Ekle</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              En fazla 5 resim yükleyebilirsiniz. Her bir resim maksimum 10MB olmalıdır.
            </p>
            {images.length === 0 && (
              <p className="text-sm text-yellow-600">
                Daha iyi sonuçlar için en az bir resim yüklemenizi öneririz.
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <Link
            href="/dashboard/property"
            className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </>
            ) : (
              'Gayrimenkul Ekle'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 