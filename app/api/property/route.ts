// Rotayı dinamik olarak işaretle - client-side caching'i önlemek için
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Property from '@/models/Property';

// GET: Gayrimenkulleri listele (filtreleme özellikli)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    await dbConnect();
    
    // URL parametrelerini al
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isFavorite = searchParams.get('isFavorite');
    const propertyType = searchParams.get('propertyType');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const city = searchParams.get('city');
    
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
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    
    // Gerekli alanlar kontrolü
    if (!data.title || !data.propertyType || !data.price || 
        !data.location || !data.location.address || 
        !data.location.city || !data.location.district || 
        !data.features || !data.features.size) {
      return Response.json({ error: 'Eksik bilgiler. Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
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