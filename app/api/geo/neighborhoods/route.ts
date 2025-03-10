import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodsData } from '@/lib/geoServicesServer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('country');
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    
    if (!countryCode || !city || !district) {
      return NextResponse.json(
        { error: 'Ülke kodu, şehir ve ilçe belirtilmedi' },
        { status: 400 }
      );
    }
    
    const neighborhoodsData = getNeighborhoodsData(countryCode, city, district);
    
    return NextResponse.json(neighborhoodsData);
  } catch (error: any) {
    console.error('Mahalle verisi API hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Mahalle verisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 