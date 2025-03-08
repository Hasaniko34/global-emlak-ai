'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

// SearchParams'ı kullanan bileşen
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Geçersiz doğrulama bağlantısı');
        return;
      }
      
      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message);
        
        // 5 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          router.push('/auth/signin');
        }, 5000);
      } catch (error: any) {
        setStatus('error');
        if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('E-posta doğrulama sırasında bir hata oluştu');
        }
      }
    };
    
    verifyEmail();
  }, [token, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            E-posta Doğrulama
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {status === 'loading' && 'E-posta adresiniz doğrulanıyor...'}
            {status === 'success' && 'E-posta adresiniz başarıyla doğrulandı'}
            {status === 'error' && 'E-posta doğrulama başarısız oldu'}
          </p>
        </div>
        
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
                <p className="mt-2 text-sm text-green-700">Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.</p>
              </div>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{message}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Link href="/auth/signin" className="font-medium text-purple-600 hover:text-purple-500">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}

// Ana bileşen
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            E-posta Doğrulama
          </h1>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
} 