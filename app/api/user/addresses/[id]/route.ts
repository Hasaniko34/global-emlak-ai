import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// Adresi sil
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Oturumu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 });
    }
    
    const addressId = context.params.id;
    
    // Adres ID'sini kontrol et
    if (!addressId || !ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: 'Geçersiz adres ID' }, { status: 400 });
    }
    
    // Veritabanına bağlan
    const { db } = await connectToDatabase();
    
    // Adresi bul ve kullanıcı sahipliğini kontrol et
    const address = await db.collection('user_addresses').findOne({
      _id: new ObjectId(addressId),
      userId: session.user.id
    });
    
    if (!address) {
      return NextResponse.json({ error: 'Adres bulunamadı veya erişim izniniz yok' }, { status: 404 });
    }
    
    // Adresi sil
    await db.collection('user_addresses').deleteOne({
      _id: new ObjectId(addressId)
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Adres silinirken hata:', error);
    return NextResponse.json({ error: 'Adres silinemedi' }, { status: 500 });
  }
}

// Adresi güncelle (etiket değişikliği)
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Oturumu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 });
    }
    
    const addressId = context.params.id;
    
    // Adres ID'sini kontrol et
    if (!addressId || !ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: 'Geçersiz adres ID' }, { status: 400 });
    }
    
    // İstek verisini al
    const data = await req.json();
    
    if (!data.label) {
      return NextResponse.json({ error: 'Etiket belirtilmedi' }, { status: 400 });
    }
    
    // Veritabanına bağlan
    const { db } = await connectToDatabase();
    
    // Adresi bul ve kullanıcı sahipliğini kontrol et
    const address = await db.collection('user_addresses').findOne({
      _id: new ObjectId(addressId),
      userId: session.user.id
    });
    
    if (!address) {
      return NextResponse.json({ error: 'Adres bulunamadı veya erişim izniniz yok' }, { status: 404 });
    }
    
    // Adresi güncelle
    await db.collection('user_addresses').updateOne(
      { _id: new ObjectId(addressId) },
      { 
        $set: { 
          label: data.label,
          updatedAt: new Date()
        } 
      }
    );
    
    // Güncellenmiş adresi al
    const updatedAddress = await db.collection('user_addresses').findOne({
      _id: new ObjectId(addressId)
    });
    
    return NextResponse.json({
      address: {
        id: updatedAddress._id.toString(),
        ...updatedAddress
      }
    });
  } catch (error) {
    console.error('Adres güncellenirken hata:', error);
    return NextResponse.json({ error: 'Adres güncellenemedi' }, { status: 500 });
  }
} 