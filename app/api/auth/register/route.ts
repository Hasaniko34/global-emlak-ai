// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose'; // mongoose.ts dosyasından dbConnect'i kullan
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Ad Soyad, E-posta ve Şifre alanları zorunludur' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      );
    }
    
    // Mongoose bağlantısı
    await dbConnect();
    console.log('Veritabanı bağlantısı başarılı, kullanıcı kaydı başlıyor');
    
    // E-posta adresi kontrolü
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }
    
    // Doğrulama token'ı oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Kullanıcıyı oluştur
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      isVerified: false
    });
    
    console.log('Kullanıcı veritabanına kaydedildi:', user._id);
    
    try {
      // Doğrulama e-postası gönder
      await sendVerificationEmail(email, verificationToken);
      console.log('Doğrulama e-postası gönderildi');
    } catch (emailError) {
      console.error('E-posta gönderimi sırasında hata:', emailError);
      // E-posta gönderiminde hata olsa bile kullanıcı oluşturuldu, devam ediyoruz
      // Kullanıcı daha sonra e-posta doğrulamasını talep edebilir
    }
    
    return NextResponse.json({
      message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.'
    });
  } catch (error: any) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { message: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
