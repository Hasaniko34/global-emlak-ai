import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full bg-black/30 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Global Emlak AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="px-4 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Giriş Yap
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 font-medium transition-all transform hover:scale-105">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-bounce-slow">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20">
                Yapay Zeka Destekli Emlak Platformu
              </span>
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Geleceğin Emlak Platformu
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Yapay zeka destekli asistanımız ile dünya genelindeki gayrimenkul trendlerini analiz edin, 
              emlak değerlemesi yapın ve yatırım fırsatlarını keşfedin.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/signup" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
                <span className="relative z-10">Hemen Başla</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link href="/about" className="group px-8 py-4 bg-white/10 text-white rounded-full text-lg font-semibold hover:bg-white/20 transition-all backdrop-blur-sm">
                <span className="relative z-10">Daha Fazla Bilgi</span>
                <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Özellikler
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Global Emlak AI platformu ile emlak dünyasında yeni bir çağ başlatın.
              Yapay zeka destekli araçlarımız ile daha akıllı kararlar verin.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-blue-400 mb-4 transform group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Emlak Değerleme</h3>
              <p className="text-gray-400">
                Yapay zeka algoritmalarımız ile gayrimenkulünüzün değerini hesaplayın, 
                kira getirisi ve yatırım analizleri alın.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="text-purple-400 mb-4 transform group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">3D Harita Görünümü</h3>
              <p className="text-gray-400">
                Dünya genelindeki emlak trendlerini interaktif 3D harita üzerinde keşfedin.
                Bölgesel analizler ve fiyat tahminleri yapın.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20">
              <div className="text-pink-400 mb-4 transform group-hover:scale-110 transition-transform">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Yapay Zeka Asistanı</h3>
              <p className="text-gray-400">
                Emlak piyasası hakkında sorularınızı sorun, uzman yapay zeka asistanımızdan 
                anında cevaplar alın.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-400">Aktif Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-gray-400">Değerleme</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">100+</div>
              <div className="text-gray-400">Şehir</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-gray-400">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-8 md:p-12 backdrop-blur-lg">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Hemen Başlayın
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Global Emlak AI platformuna katılın ve emlak dünyasında yapay zeka ile öne çıkın.
              </p>
              <Link href="/auth/signup" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
                Ücretsiz Hesap Oluştur
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Global Emlak AI</h3>
              <p className="text-gray-400 text-sm">
                Yapay zeka destekli emlak platformu ile geleceği şekillendirin.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">Hakkımızda</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white text-sm">Özellikler</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white text-sm">Fiyatlandırma</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Yasal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm">Gizlilik Politikası</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm">Kullanım Koşulları</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white text-sm">Çerez Politikası</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">info@globalemlakai.com</li>
                <li className="text-gray-400 text-sm">+90 (555) 123 45 67</li>
                <li className="text-gray-400 text-sm">İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2024 Global Emlak AI - Tüm Hakları Saklıdır</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
