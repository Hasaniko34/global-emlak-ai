import { NextRequest, NextResponse } from 'next/server';
import { getCountryData } from '@/lib/geoServicesServer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('code');
    
    if (!countryCode) {
      return NextResponse.json(
        { error: 'Ülke kodu belirtilmedi' },
        { status: 400 }
      );
    }
    
    const countryData = getCountryData(countryCode);
    
    if (!countryData) {
      return NextResponse.json(
        { error: `${countryCode} için veri bulunamadı` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(countryData);
  } catch (error: any) {
    console.error('Ülke verisi API hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Ülke verisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 