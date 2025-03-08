// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import Property from '@/models/Property';

// GET: Portföyleri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    await dbConnect();
    
    const portfolios = await Portfolio.find({
      userId: (session.user as any).id
    }).sort({ createdAt: -1 }).populate({
      path: 'properties',
      model: Property,
    });
    
    return Response.json({ portfolios }, { status: 200 });
  } catch (error) {
    console.error('Portföy listesi hatası:', error);
    return Response.json({ error: 'Portföyler yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}

// POST: Yeni portföy ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    await dbConnect();
    
    const data = await request.json();
    
    // Portföy adının zorunlu olduğunu kontrol et
    if (!data.name || !data.name.trim()) {
      return Response.json({ error: 'Portföy adı zorunludur.' }, { status: 400 });
    }
    
    // Kullanıcı ID'sini ekle
    data.userId = (session.user as any).id;
    
    // PropertyIds varsa, bunları doğrula
    if (data.propertyIds && data.propertyIds.length > 0) {
      // Tüm ID'lerin geçerli olduğunu kontrol et
      const validIds = data.propertyIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
      
      if (validIds.length !== data.propertyIds.length) {
        return Response.json({ error: 'Geçersiz gayrimenkul ID formatı.' }, { status: 400 });
      }
      
      // Bu gayrimenkullerin kullanıcıya ait olup olmadığını kontrol et
      const properties = await Property.find({
        _id: { $in: validIds },
        userId: (session.user as any).id
      });
      
      if (properties.length !== validIds.length) {
        return Response.json({ 
          error: 'Bir veya daha fazla gayrimenkule erişim izniniz yok.' 
        }, { status: 403 });
      }
      
      // Toplam değer, gelir ve giderleri hesapla
      let totalValue = 0;
      let totalIncome = 0;
      let totalExpenses = 0;
      
      properties.forEach(property => {
        totalValue += property.financials.currentValue || property.price;
        totalIncome += property.financials.monthlyIncome || 0;
        totalExpenses += property.financials.monthlyExpenses || 0;
      });
      
      // Performans metriklerini hesapla
      const cashFlow = totalIncome - totalExpenses;
      const overallROI = totalValue > 0 ? (cashFlow * 12) / totalValue : 0;
      
      // Veriyi güncelle
      data.totalValue = totalValue;
      data.totalIncome = totalIncome;
      data.totalExpenses = totalExpenses;
      data.cashFlow = cashFlow;
      data.overallROI = overallROI;
    }
    
    // Yeni portföyü oluştur
    const portfolio = await Portfolio.create(data);
    
    // Detaylı portföy bilgisini al (gayrimenkulleri de içerecek şekilde)
    const populatedPortfolio = await Portfolio.findById(portfolio._id).populate({
      path: 'properties',
      model: Property,
    });
    
    return Response.json({ portfolio: populatedPortfolio, message: 'Portföy başarıyla oluşturuldu.' }, { status: 201 });
  } catch (error: any) {
    console.error('Portföy oluşturma hatası:', error);
    
    if (error.name === 'ValidationError') {
      return Response.json({ 
        error: 'Doğrulama hatası: ' + Object.values(error.errors).map((err: any) => err.message).join(', ') 
      }, { status: 400 });
    }
    
    return Response.json({ error: 'Portföy oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
} 