'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewUser() {
  const router = useRouter();
  
  useEffect(() => {
    // 5 saniye sonra ana sayfaya yönlendir
    const timeout = setTimeout(() => {
      router.push('/');
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hoş Geldiniz!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınız başarıyla oluşturuldu.
          </p>
        </div>
        
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Hesabınız hazır
              </p>
              <p className="mt-2 text-sm text-green-700">
                Birkaç saniye içinde ana sayfaya yönlendirileceksiniz.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/" className="font-medium text-purple-600 hover:text-purple-500">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
} 