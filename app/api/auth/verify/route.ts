// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz doğrulama tokeni' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Tokene sahip kullanıcıyı bul
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz doğrulama tokeni veya kullanıcı bulunamadı' },
        { status: 400 }
      );
    }
    
    // Kullanıcıyı doğrulanmış olarak işaretle
    user.emailVerified = new Date();
    
    // TypeScript uyumlu hale getir
    const userDocument = user as any;
    userDocument.verificationToken = undefined;
    
    await user.save();
    
    // Kullanıcıyı giriş sayfasına yönlendir
    return NextResponse.redirect(new URL('/auth/signin?verified=true', request.url));
  } catch (error) {
    console.error('E-posta doğrulama hatası:', error);
    return NextResponse.json(
      { success: false, message: 'E-posta doğrulama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
