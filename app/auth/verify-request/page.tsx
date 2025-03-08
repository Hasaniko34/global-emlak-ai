'use client';

import Link from 'next/link';

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            E-posta Doğrulama Gerekli
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınızı etkinleştirmek için e-posta adresinizi doğrulamanız gerekiyor.
          </p>
        </div>
        
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Lütfen e-posta kutunuzu kontrol edin
              </p>
              <p className="mt-2 text-sm text-blue-700">
                Size gönderdiğimiz doğrulama bağlantısına tıklayarak hesabınızı etkinleştirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/auth/signin" className="font-medium text-purple-600 hover:text-purple-500">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
} 