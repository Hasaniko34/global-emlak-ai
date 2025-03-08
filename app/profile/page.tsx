'use client';

import Link from 'next/link';

// Server-side rendering'den kaçınmak için
export const dynamic = 'force-dynamic';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profil Sayfası
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Kişisel bilgileriniz ve hesap ayarlarınız.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-6 sm:px-6">
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Profili Düzenle
                  </Link>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 