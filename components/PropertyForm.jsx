'use client';

import { useState } from 'react';
import axios from 'axios';

export default function PropertyForm({ onResult }) {
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [rooms, setRooms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
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
      
      if (onResult && typeof onResult === 'function') {
        onResult(response.data.data);
      }
    } catch (error) {
      console.error('Değerleme hatası:', error);
      setError('Değerleme yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4" data-testid="property-form">
      <div>
        <label className="block mb-1">Emlak Tipi</label>
        <input
          className="w-full p-2 border rounded"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          placeholder="Ör: Daire, Ev, Arsa ..."
          required
          data-testid="property-type-input"
        />
      </div>
      
      <div>
        <label className="block mb-1">Konum (Adres veya Şehir)</label>
        <input
          className="w-full p-2 border rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ör: İstanbul, Kadıköy ..."
          required
          data-testid="location-input"
        />
      </div>
      
      <div>
        <label className="block mb-1">Metrekare</label>
        <input
          className="w-full p-2 border rounded"
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Ör: 120"
          required
          data-testid="size-input"
        />
      </div>
      
      <div>
        <label className="block mb-1">Oda Sayısı</label>
        <input
          className="w-full p-2 border rounded"
          type="number"
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          placeholder="Ör: 3"
          required
          data-testid="rooms-input"
        />
      </div>
      
      <button
        type="submit"
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-purple-400"
        disabled={loading}
        data-testid="submit-button"
      >
        {loading ? 'Değerleniyor...' : 'Değerle'}
      </button>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded" data-testid="error-message">
          {error}
        </div>
      )}
    </form>
  );
} 