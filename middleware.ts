import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CSRF koruması için basit bir token doğrulama fonksiyonu
const validateCSRFToken = (request: NextRequest): boolean => {
  // GET istekleri için atla
  if (request.method === 'GET') return true;
  
  // API rotaları için CSRF token kontrolü
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const csrfToken = request.headers.get('x-csrf-token');
    const storedToken = request.cookies.get('csrfToken')?.value;
    
    // Token yoksa veya eşleşmiyorsa başarısız
    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return false;
    }
  }
  
  return true;
};

// Rate limit sözlüğü
const ipRequests: Record<string, { count: number, timestamp: number }> = {};

// Rate limit kontrol fonksiyonu
const checkRateLimit = (ip: string, limit = 100, window = 60000): boolean => {
  const now = Date.now();
  
  // IP adresinin önceki isteklerini al veya yeni bir kayıt oluştur
  const record = ipRequests[ip] || { count: 0, timestamp: now };
  
  // Zaman penceresi yenilendiyse, sayacı sıfırla
  if (now - record.timestamp > window) {
    record.count = 0;
    record.timestamp = now;
  }
  
  // İstek sayısını artır
  record.count += 1;
  ipRequests[ip] = record;
  
  // Limiti aşıp aşmadığını kontrol et
  return record.count <= limit;
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Kullanıcının IP adresini al
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  
  // API istekleri için rate limiting uygula
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // API için dakikada 100 istek sınırı uygula
    if (!checkRateLimit(ip, 100, 60000)) {
      return new NextResponse(JSON.stringify({ error: 'Çok fazla istek yaptınız. Lütfen daha sonra tekrar deneyin.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      });
    }
    
    // CSRF token kontrolü
    if (!validateCSRFToken(request)) {
      return new NextResponse(JSON.stringify({ error: 'Geçersiz veya eksik güvenlik tokeni.' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
  
  // Güvenlik başlıkları ekle
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
  
  // Yanıta güvenlik başlıklarını ekle
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Middleware'in uygulanacağı rotaları belirt
export const config = {
  matcher: [
    // API rotaları
    '/api/:path*',
    // Auth rotaları
    '/auth/:path*',
    // Dashboard rotaları
    '/dashboard/:path*',
  ],
}; 