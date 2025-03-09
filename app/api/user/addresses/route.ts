import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// Tüm adresleri getir
export async function GET(request: NextRequest) {
  try {
    // Oturumu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 });
    }
    
    // Veritabanına bağlan
    const connection = await connectToDatabase();
    const db = connection.db;
    
    if (!db) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı kurulamadı' }, { status: 500 });
    }
    
    // Kullanıcının adreslerini al
    const addresses = await db.collection('user_addresses')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Adresler alınırken hata:', error);
    return NextResponse.json({ error: 'Adresler alınamadı' }, { status: 500 });
  }
}

// Yeni adres ekle
export async function POST(request: NextRequest) {
  try {
    // Oturumu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 });
    }
    
    // İstek verisini al
    const data = await request.json();
    
    // Zorunlu alanları kontrol et
    if (!data.country || !data.city || !data.streetAddress) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }
    
    // Veritabanına bağlan
    const connection = await connectToDatabase();
    const db = connection.db;
    
    if (!db) {
      return NextResponse.json({ error: 'Veritabanı bağlantısı kurulamadı' }, { status: 500 });
    }
    
    // Adresi oluştur
    const addressToInsert = {
      userId: session.user.id,
      label: data.label,
      countryCode: data.countryCode,
      country: data.country,
      city: data.city,
      district: data.district || '',
      streetAddress: data.streetAddress,
      postalCode: data.postalCode || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Veritabanına ekle
    const result = await db.collection('user_addresses').insertOne(addressToInsert);
    
    // Yanıt döndür
    return NextResponse.json({
      address: {
        id: result.insertedId.toString(),
        ...addressToInsert
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Adres kaydedilirken hata:', error);
    return NextResponse.json({ error: 'Adres kaydedilemedi' }, { status: 500 });
  }
} 