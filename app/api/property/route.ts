// Rotayı dinamik olarak işaretle - client-side caching'i önlemek için
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Property from '@/models/Property';
import { sanitizeObject, validateInputs } from '@/lib/security';

// Maksimum API istekleri sayısı (dakikada)
const MAX_REQUESTS_PER_MINUTE = 100;

// Rate limiter için basit bir in-memory store
type RateLimitStore = {
  [ip: string]: {
    count: number;
    resetTime: number;
  }
};

const rateLimitStore: RateLimitStore = {};

/**
 * Rate limit kontrolü
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 dakika

  // Yeni bir IP için kayıt oluştur
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + windowMs
    };
    return true;
  }

  const record = rateLimitStore[ip];

  // Zaman penceresi geçtiyse, sayacı sıfırla
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  // İstek limiti aşıldıysa
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  // İstek sayısını artır
  record.count++;
  return true;
}

// GET: Gayrimenkulleri listele (filtreleme özellikli)
export async function GET(request: NextRequest) {
  try {
    // IP adresini al
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // Rate limit kontrolü
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Çok fazla istek yapıldı. Lütfen daha sonra tekrar deneyin.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    await dbConnect();
    
    // URL parametrelerini al
    const searchParams = request.nextUrl.searchParams;
    
    // Parametreleri XSS'e karşı temizle
    const userId = searchParams.get('userId') ? sanitizeObject({ userId: searchParams.get('userId') }).userId : null;
    const isFavorite = searchParams.get('isFavorite');
    const propertyType = searchParams.get('propertyType') ? sanitizeObject({ propertyType: searchParams.get('propertyType') }).propertyType : null;
    const status = searchParams.get('status') ? sanitizeObject({ status: searchParams.get('status') }).status : null;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const city = searchParams.get('city') ? sanitizeObject({ city: searchParams.get('city') }).city : null;
    
    // Filtreleri oluştur
    const query: any = {
      userId: (session.user as any).id
    };
    
    // Eğer yönetici başka bir kullanıcının gayrimenkullerini görüntülemek istiyorsa (admin panel için)
    if (userId && (session.user as any).role === 'admin') {
      query.userId = userId;
    }
    
    if (isFavorite === 'true') {
      query.isFavorite = true;
    } else if (isFavorite === 'false') {
      query.isFavorite = false;
    }
    
    if (propertyType) {
      query.propertyType = propertyType;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
    }
    
    if (city) {
      query['location.city'] = city;
    }
    
    // Gayrimenkulleri al
    const properties = await Property.find(query).sort({ createdAt: -1 });
    
    return Response.json({ properties }, { status: 200 });
  } catch (error) {
    console.error('Gayrimenkul listesi hatası:', error);
    return Response.json({ error: 'Gayrimenkuller yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

// POST: Yeni gayrimenkul ekle
export async function POST(request: NextRequest) {
  try {
    // IP adresini al
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // Rate limit kontrolü
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Çok fazla istek yapıldı. Lütfen daha sonra tekrar deneyin.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    await dbConnect();
    
    let data = await request.json();
    
    // XSS temizliği yap
    data = sanitizeObject(data);
    
    // Girdi doğrulaması
    const validationRules = {
      title: { required: true, minLength: 3, maxLength: 100 },
      propertyType: { required: true },
      price: { required: true, numeric: true, min: 0 },
      'location.address': { required: true, minLength: 5, maxLength: 200 },
      'location.city': { required: true, minLength: 2, maxLength: 50 },
      'location.district': { required: true, minLength: 2, maxLength: 50 },
      'features.size': { required: true, numeric: true, min: 1 },
    };
    
    // Yukarıdaki kurallara göre doğrulama yap
    const validation = validateInputs({
      title: data.title,
      propertyType: data.propertyType,
      price: data.price,
      'location.address': data.location?.address,
      'location.city': data.location?.city,
      'location.district': data.location?.district,
      'features.size': data.features?.size
    }, validationRules);
    
    if (!validation.valid) {
      return Response.json({ 
        error: 'Doğrulama hatası', 
        details: validation.errors 
      }, { status: 400 });
    }
    
    // Kullanıcı ID'sini ekle
    data.userId = (session.user as any).id;
    
    // Yeni gayrimenkulü oluştur
    const property = await Property.create(data);
    
    return Response.json({ property, message: 'Gayrimenkul başarıyla eklendi.' }, { status: 201 });
  } catch (error: any) {
    console.error('Gayrimenkul ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      return Response.json({ 
        error: 'Doğrulama hatası: ' + Object.values(error.errors).map((err: any) => err.message).join(', ') 
      }, { status: 400 });
    }
    
    return Response.json({ error: 'Gayrimenkul eklenirken bir hata oluştu.' }, { status: 500 });
  }
} 