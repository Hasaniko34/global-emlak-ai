// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Property from '@/models/Property';

// GET: Belirli bir gayrimenkulü getir
export async function GET(
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
    
    const property = await Property.findOne({
      _id: id,
      userId: (session.user as any).id
    });
    
    if (!property) {
      return Response.json({ error: 'Gayrimenkul bulunamadı.' }, { status: 404 });
    }
    
    return Response.json({ property }, { status: 200 });
  } catch (error) {
    console.error('Gayrimenkul getirme hatası:', error);
    return Response.json({ error: 'Gayrimenkul getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// PUT: Gayrimenkulü güncelle
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
    const existingProperty = await Property.findOne({
      _id: id,
      userId: (session.user as any).id
    });
    
    if (!existingProperty) {
      return Response.json({ error: 'Gayrimenkul bulunamadı veya erişim izniniz yok.' }, { status: 404 });
    }
    
    const data = await request.json();
    
    // userId'nin değiştirilmesini engelle
    if (data.userId) {
      delete data.userId;
    }
    
    // Gayrimenkulü güncelle
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    return Response.json({ property: updatedProperty }, { status: 200 });
  } catch (error: any) {
    console.error('Gayrimenkul güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      return Response.json({ 
        error: 'Doğrulama hatası: ' + Object.values(error.errors).map((err: any) => err.message).join(', ') 
      }, { status: 400 });
    }
    
    return Response.json({ error: 'Gayrimenkul güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}

// DELETE: Gayrimenkulü sil
export async function DELETE(
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
    
    // Gayrimenkulü sil
    await Property.findByIdAndDelete(id);
    
    return Response.json({ message: 'Gayrimenkul başarıyla silindi.' }, { status: 200 });
  } catch (error) {
    console.error('Gayrimenkul silme hatası:', error);
    return Response.json({ error: 'Gayrimenkul silinirken bir hata oluştu.' }, { status: 500 });
  }
} 