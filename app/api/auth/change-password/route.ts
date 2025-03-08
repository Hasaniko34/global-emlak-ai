// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    const { currentPassword, newPassword } = await request.json();
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Mevcut şifre ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'Yeni şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Mevcut şifreyi kontrol et
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }
    
    // Yeni şifreyi güncelle
    user.password = newPassword;
    await user.save();
    
    return NextResponse.json({
      message: 'Şifreniz başarıyla güncellendi'
    });
  } catch (error: any) {
    console.error('Şifre değiştirme hatası:', error);
    return NextResponse.json(
      { message: 'Şifre değiştirme sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
