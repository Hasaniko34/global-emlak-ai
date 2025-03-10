import { NextRequest, NextResponse } from 'next/server';
import { getDistrictsData } from '@/lib/geoServicesServer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('country');
    const city = searchParams.get('city');
    
    if (!countryCode || !city) {
      return NextResponse.json(
        { error: 'Ülke kodu ve şehir belirtilmedi' },
        { status: 400 }
      );
    }
    
    const districtsData = getDistrictsData(countryCode, city);
    
    return NextResponse.json(districtsData);
  } catch (error: any) {
    console.error('İlçe verisi API hatası:', error);
    return NextResponse.json(
      { error: error.message || 'İlçe verisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 