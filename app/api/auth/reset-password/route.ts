// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Token'ı hashle
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Token'a sahip kullanıcıyı bul
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      );
    }
    
    // Şifreyi güncelle
    user.password = password;
    
    // resetPasswordToken ve resetPasswordExpire özelliklerini TypeScript uyumlu hale getir
    const userDocument = user as any;
    userDocument.resetPasswordToken = undefined;
    userDocument.resetPasswordExpire = undefined;
    
    await user.save();
    
    return NextResponse.json({
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error: any) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json(
      { message: 'Şifre sıfırlama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
