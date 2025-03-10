import { NextRequest, NextResponse } from 'next/server';
import { getCitiesData } from '@/lib/geoServicesServer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('country');
    
    if (!countryCode) {
      return NextResponse.json(
        { error: 'Ülke kodu belirtilmedi' },
        { status: 400 }
      );
    }
    
    const citiesData = getCitiesData(countryCode);
    
    return NextResponse.json(citiesData);
  } catch (error: any) {
    console.error('Şehir verisi API hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Şehir verisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 