'use client';

import { HomeIcon, ChartBarIcon, MapIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Toplam İlan',
      value: '1,234',
      icon: HomeIcon,
      color: 'blue',
    },
    {
      title: 'Değerleme Sayısı',
      value: '567',
      icon: ChartBarIcon,
      color: 'green',
    },
    {
      title: 'AI Sohbet Sayısı',
      value: '890',
      icon: ChatBubbleLeftRightIcon,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hoş Geldiniz</h1>
        <p className="mt-2 text-gray-600">Global Emlak AI ile emlak işlemlerinizi kolaylaştırın</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`rounded-lg bg-${stat.color}-100 p-3`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-gray-600">Yeni emlak değerlemesi yapıldı</p>
            <span className="text-sm text-gray-400">2 saat önce</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-gray-600">Yeni ilan eklendi</p>
            <span className="text-sm text-gray-400">4 saat önce</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-gray-600">AI asistan ile görüşme yapıldı</p>
            <span className="text-sm text-gray-400">6 saat önce</span>
          </div>
        </div>
      </div>
    </div>
  );
} 