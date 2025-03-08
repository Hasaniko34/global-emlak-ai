'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();
  
  useEffect(() => {
    const handleSignOut = async () => {
      await signOut({ redirect: false });
      router.push('/');
    };
    
    handleSignOut();
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Çıkış Yapılıyor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lütfen bekleyin...
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  );
} 