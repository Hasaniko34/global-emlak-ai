'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// SearchParams'ı kullanan bileşen
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Hata mesajları haritası
    const errorMessages: Record<string, string> = {
      default: 'Bir hata oluştu',
      configuration: 'Sunucu yapılandırma hatası',
      accessdenied: 'Erişim reddedildi',
      verification: 'Doğrulama hatası',
      'invalid-token': 'Geçersiz token',
      'email-not-verified': 'E-posta adresi doğrulanmadı',
      'invalid-credentials': 'Geçersiz giriş bilgileri',
      'account-locked': 'Hesabınız kilitlendi',
      'server-error': 'Sunucu hatası'
    };

    // URL'deki hata koduna göre mesajı ayarla veya varsayılan mesajı kullan
    setErrorMessage(error ? (errorMessages[error] || errorMessages.default) : errorMessages.default);
  }, [error]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="m-auto w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Kimlik Doğrulama Hatası
          </h2>
          
          <p className="mt-2 text-gray-600">
            {errorMessage}
          </p>
          
          <div className="mt-6 space-y-3">
            <Link 
              href="/auth/signin" 
              className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Giriş Sayfasına Dön
            </Link>
            
            <Link 
              href="/" 
              className="block w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ana sayfa bileşeni
export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-gray-100">
        <div className="m-auto w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 