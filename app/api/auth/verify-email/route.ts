// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    // URL'den token'ı al
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Doğrulama token\'ı gereklidir' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz doğrulama token\'ı' },
        { status: 400 }
      );
    }
    
    // Kullanıcıyı doğrulanmış olarak işaretle
    const userDocument = user as any;
    userDocument.isVerified = true;
    userDocument.verificationToken = undefined;
    await user.save();
    
    return NextResponse.json({
      message: 'E-posta adresiniz başarıyla doğrulandı'
    });
  } catch (error: any) {
    console.error('E-posta doğrulama hatası:', error);
    return NextResponse.json(
      { message: 'E-posta doğrulama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
