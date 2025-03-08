// Rotayı dinamik olarak işaretle - client-side caching'i önlemek için
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Büyük dosyaları işleyebilmek için
export const maxDuration = 60; // 60 saniye

// 50MB maksimum boyut
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

// POST: Dosya yükleme
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    // multipart/form-data formundan dosyayı al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }
    
    // Dosya boyutunu kontrol et (10MB'a kadar izin ver)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'Dosya boyutu 10MB\'tan büyük olamaz.' }, { status: 400 });
    }
    
    // Dosya tipini kontrol et
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ 
        error: 'Sadece JPEG, PNG ve WebP formatları desteklenmektedir.' 
      }, { status: 400 });
    }
    
    // Dosya içeriğini ArrayBuffer'a çevir
    const fileBuffer = await file.arrayBuffer();
    
    // Eşsiz bir dosya adı oluştur
    const fileId = uuidv4();
    const extension = file.name.split('.').pop();
    const fileName = `${fileId}.${extension}`;
    
    // Kullanıcının ID'sine göre dizin yolu oluştur
    const userDir = path.join(process.cwd(), 'public', 'uploads', (session.user as any).id);
    
    // Dizin yoksa oluştur
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    // Dosya yolunu oluştur
    const filePath = path.join(userDir, fileName);
    
    // Dosyayı kaydet
    fs.writeFileSync(filePath, Buffer.from(fileBuffer));
    
    // URL yolunu oluştur (public/uploads dizini web'den erişilebilir)
    const relativePath = `/uploads/${(session.user as any).id}/${fileName}`;
    
    return Response.json({ 
      url: relativePath,
      fileName: fileName,
      message: 'Dosya başarıyla yüklendi.'
    }, { status: 200 });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return Response.json({ error: 'Dosya yüklenirken bir hata oluştu.' }, { status: 500 });
  }
} 