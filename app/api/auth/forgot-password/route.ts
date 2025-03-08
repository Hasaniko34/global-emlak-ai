// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import { sendResetPasswordEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Şifre sıfırlama token'ı oluştur
    const resetToken = user.generateResetToken();
    await user.save();
    
    // Şifre sıfırlama e-postası gönder
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    if (user.email) {
      await sendResetPasswordEmail(user.email, resetUrl);
    }
    
    return NextResponse.json({
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi'
    });
  } catch (error: any) {
    console.error('Şifre sıfırlama isteği hatası:', error);
    return NextResponse.json(
      { message: 'Şifre sıfırlama isteği sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
