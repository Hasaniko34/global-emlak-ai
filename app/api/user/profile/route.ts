// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Profil bilgileri alma hatası:', error);
    return NextResponse.json(
      { message: 'Profil bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    const { name, email, phone, address } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Ad Soyad ve E-posta alanları zorunludur' },
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
    
    // E-posta değişikliği varsa ve başka bir kullanıcı tarafından kullanılıyorsa
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor' },
          { status: 400 }
        );
      }
    }
    
    // Profil bilgilerini güncelle
    if (name && email) {
      user.name = name;
      user.email = email;
      
      // TypeScript uyumlu hale getir
      const userDocument = user as any;
      userDocument.phone = phone;
      userDocument.address = address;
      
      await user.save();

      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: userDocument.phone,
          address: userDocument.address,
          role: user.role
        }
      });
    }
  } catch (error: any) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { message: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
