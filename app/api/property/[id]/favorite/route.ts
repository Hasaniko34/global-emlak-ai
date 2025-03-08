// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Property from '@/models/Property';

// PUT: Gayrimenkulün favori durumunu güncelle
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Geçersiz gayrimenkul ID formatı.' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Gayrimenkulün varlığını ve kullanıcıya ait olduğunu kontrol et
    const property = await Property.findOne({
      _id: id,
      userId: (session.user as any).id
    });
    
    if (!property) {
      return Response.json({ error: 'Gayrimenkul bulunamadı veya erişim izniniz yok.' }, { status: 404 });
    }
    
    // Favori durumunu tersine çevir
    property.isFavorite = !property.isFavorite;
    await property.save();
    
    return Response.json({ property, message: 'Favori durumu güncellendi.' }, { status: 200 });
  } catch (error) {
    console.error('Favori güncelleme hatası:', error);
    return Response.json({ error: 'Favori durumu güncellenirken bir hata oluştu.' }, { status: 500 });
  }
} 