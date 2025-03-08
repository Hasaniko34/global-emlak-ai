'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NewPropertyPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
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
    monthlyExpenses: '0',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form girişlerini güncelleme
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      return isValid;
    });
    
    if (validFiles.length === 0) return;
    
    setImages(prev => [...prev, ...validFiles]);
    
    // Önizleme URL'leri oluştur
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Hata varsa temizle
    setError(null);
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
    
    // Zorunlu alanları kontrol et
    if (!formData.title || !formData.propertyType || !formData.address || !formData.city || 
        !formData.district || !formData.size || !formData.price) {
      setError('Lütfen zorunlu alanları doldurun.');
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
            currentValue: Number(formData.price), // Alış fiyatı başlangıçta güncel değer olarak kullanılır
            monthlyIncome: Number(formData.monthlyIncome),
            monthlyExpenses: Number(formData.monthlyExpenses),
          },
        }),
      });
      
      if (!propertyResponse.ok) {
        const errorData = await propertyResponse.json();
        throw new Error(errorData.error || 'Gayrimenkul kaydedilirken bir hata oluştu');
      }
      
      const propertyData = await propertyResponse.json();
      const propertyId = propertyData.property._id;
      
      // Resimler varsa yükle
      if (images.length > 0) {
        const uploadPromises = images.map(async (image) => {
          const formData = new FormData();
          formData.append('file', image);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Resim yüklenirken bir hata oluştu');
          }
          
          return uploadResponse.json();
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        const imageUrls = uploadResults.map(result => result.url);
        
        // Gayrimenkule resimleri ekle
        if (imageUrls.length > 0) {
          const updateResponse = await fetch(`/api/property/${propertyId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              images: imageUrls,
            }),
          });
          
          if (!updateResponse.ok) {
            console.error('Resimler gayrimenkule eklenirken bir hata oluştu');
          }
        }
      }
      
      // Başarılı kayıt sonrası gayrimenkul detay sayfasına yönlendir
      router.push(`/dashboard/property/${propertyId}`);
    } catch (err: any) {
      console.error('Gayrimenkul kaydetme hatası:', err);
      setError(err.message || 'Gayrimenkul kaydedilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/property"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Gayrimenkullere Dön</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Gayrimenkul Ekle</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Bahçeli Müstakil Ev"
                required
              />
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="apartment">Daire</option>
                <option value="house">Ev</option>
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Atatürk Mahallesi, Millet Caddesi No:15 Daire:4"
                required
              />
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: İstanbul"
                required
              />
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Kadıköy"
                required
              />
            </div>
            
            <h2 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-4">
              Özellikler
            </h2>
            
            <div>
              <label htmlFor="size" className="block text-gray-700 font-medium mb-2">
                Alan (m²) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: 120"
                min="0"
                step="0.01"
                required
              />
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: 2"
                min="0"
              />
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
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: 2015"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div>
              <label htmlFor="heating" className="block text-gray-700 font-medium mb-2">
                Isıtma
              </label>
              <input
                type="text"
                id="heating"
                name="heating"
                value={formData.heating}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Doğalgaz Kombi"
              />
            </div>
            
            <h2 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-4">
              Finansal Bilgiler
            </h2>
            
            <div>
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                Alış Fiyatı <span className="text-red-600">*</span>
              </label>
              <div className="flex">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="flex-grow p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 1500000"
                  min="0"
                  step="0.01"
                  required
                />
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-20 p-3 border border-gray-300 border-l-0 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TL">TL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="monthlyIncome" className="block text-gray-700 font-medium mb-2">
                Aylık Gelir
              </label>
              <div className="flex">
                <input
                  type="number"
                  id="monthlyIncome"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="flex-grow p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 8000"
                  min="0"
                  step="0.01"
                />
                <span className="inline-flex items-center px-3 bg-gray-100 text-gray-600 border border-l-0 border-gray-300 rounded-r">
                  TL
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="monthlyExpenses" className="block text-gray-700 font-medium mb-2">
                Aylık Gider
              </label>
              <div className="flex">
                <input
                  type="number"
                  id="monthlyExpenses"
                  name="monthlyExpenses"
                  value={formData.monthlyExpenses}
                  onChange={handleChange}
                  className="flex-grow p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 1000"
                  min="0"
                  step="0.01"
                />
                <span className="inline-flex items-center px-3 bg-gray-100 text-gray-600 border border-l-0 border-gray-300 rounded-r">
                  TL
                </span>
              </div>
            </div>
            
            <h2 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-4">
              Resimler
            </h2>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">
                Fotoğraflar
              </label>
              
              <div className="flex flex-wrap gap-4 mb-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Önizleme ${index + 1}`} 
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 border border-gray-300 shadow-sm"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
                
                <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Fotoğraf Ekle</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">
                En fazla 10 fotoğraf yükleyebilirsiniz. Her bir fotoğraf en fazla 5MB olabilir.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link
              href="/dashboard/property"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded mr-2 hover:bg-gray-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 