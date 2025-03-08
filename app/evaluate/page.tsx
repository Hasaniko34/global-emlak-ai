'use client';

import { useState } from 'react';
import axios from 'axios';

export default function EvaluatePage() {
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [rooms, setRooms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/evaluate', {
        propertyType,
        location,
        size: Number(size),
        rooms: Number(rooms),
      });
      
      setResult(response.data.data);
    } catch (err) {
      console.error('Değerleme hatası:', err);
      setError('Değerleme yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Emlak Değerleme Formu</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Emlak Tipi</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                placeholder="Ör: Daire, Ev, Arsa ..."
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Konum (Adres veya Şehir)</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ör: İstanbul, Kadıköy ..."
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Metrekare</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Ör: 120"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Oda Sayısı</label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                type="number"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                placeholder="Ör: 3"
                required
              />
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Değerleniyor...' : 'Değerle'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Tahmini Değerleme Sonucu</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Emlak Tipi:</p>
                <p className="font-medium">{result.propertyType}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Konum:</p>
                <p className="font-medium">{result.location}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Metrekare:</p>
                <p className="font-medium">{result.size} m²</p>
              </div>
              
              <div>
                <p className="text-gray-600">Oda Sayısı:</p>
                <p className="font-medium">{result.rooms}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Tahmini Değer:</p>
                <p className="font-medium text-green-700">
                  {result.estimatedValue.toLocaleString('tr-TR')} {result.currency}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Tahmini Aylık Kira:</p>
                <p className="font-medium text-green-700">
                  {result.estimatedRent.toLocaleString('tr-TR')} {result.currency}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600">Yıllık Getiri Oranı (ROI):</p>
                <p className="font-medium text-blue-700">%{result.roi}</p>
              </div>
            </div>
            
            {result.marketAnalysis && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-2 text-blue-700">Piyasa Analizi</h3>
                <p className="text-gray-700">{result.marketAnalysis}</p>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Not: Bu değerleme tahmini olup, gerçek piyasa değerleri farklılık gösterebilir.
                Daha kesin sonuçlar için profesyonel bir emlak değerleme uzmanına danışmanızı öneririz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 