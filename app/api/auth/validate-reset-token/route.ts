// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Token gereklidir' },
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
    
    return NextResponse.json({ message: 'Token geçerli' });
  } catch (error: any) {
    console.error('Token doğrulama hatası:', error);
    return NextResponse.json(
      { message: 'Token doğrulama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
