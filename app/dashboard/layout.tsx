'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, ChartBarIcon, MapIcon, ChatBubbleLeftRightIcon, Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const menuItems = [
    { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { href: '/dashboard/evaluate', icon: ChartBarIcon, label: 'Emlak Değerleme' },
    { href: '/dashboard/map', icon: MapIcon, label: '3D Harita' },
    { href: '/dashboard/ai-assistant', icon: ChatBubbleLeftRightIcon, label: 'AI Asistan' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Global Emlak AI
            </h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-all ${
                  pathname === item.href ? 'bg-blue-50 text-blue-600 shadow-sm' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Alt Menü */}
          <div className="p-4 border-t border-gray-100">
            <div className="space-y-2">
              <Link
                href="/dashboard/profile"
                className="flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                <UserCircleIcon className="w-5 h-5 mr-3" />
                Profil
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`md:ml-64 transition-all duration-300`}>
        {/* Top Navigation */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4 md:hidden"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname === '/dashboard/evaluate' && 'Emlak Değerleme'}
              {pathname === '/dashboard/map' && '3D Harita'}
              {pathname === '/dashboard/ai-assistant' && 'AI Asistan'}
              {pathname === '/dashboard/profile' && 'Profil'}
            </h2>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 