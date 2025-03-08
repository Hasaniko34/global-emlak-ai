'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      });
      
      setSuccess('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
      
      // 5 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        window.location.href = '/auth/signin';
      }, 5000);
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('Kayıt sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Hesap Oluştur
              </span>
            </h1>
            <p className="text-gray-400">
              Global Emlak AI platformuna katılın
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-400 text-sm">{success}</p>
              </div>
              <p className="mt-2 text-sm text-green-400">
                Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Ad Soyad
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
                placeholder="Adınız ve soyadınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-400">
                En az 8 karakter olmalıdır
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded bg-white/5"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                <span>
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    Kullanım koşullarını
                  </Link>
                  {' '}ve{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                    gizlilik politikasını
                  </Link>
                  {' '}kabul ediyorum
                </span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </div>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Zaten hesabınız var mı?{' '}
              <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-pink-600/40 animate-pulse"></div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Yapay Zeka ile Emlak
              </span>
            </h2>
            <p className="text-2xl text-white mb-12 leading-relaxed drop-shadow-lg">
              Emlak dünyasında yapay zeka teknolojileri ile öne çıkın.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-pink-400/50 transition-all duration-300 shadow-xl">
                <div className="text-pink-400 mb-6">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Yapay Zeka Asistanı</h3>
                <p className="text-white text-lg">
                  Anında cevaplar alın
                </p>
              </div>
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-300 shadow-xl">
                <div className="text-green-400 mb-6">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Güvenli İşlem</h3>
                <p className="text-white text-lg">
                  %100 güvenli platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 