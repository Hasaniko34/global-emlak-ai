import { NextRequest, NextResponse } from 'next/server';
import { getStreetsData } from '@/lib/geoServicesServer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('country');
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const neighborhood = searchParams.get('neighborhood');
    
    if (!countryCode || !city || !district || !neighborhood) {
      return NextResponse.json(
        { error: 'Ülke kodu, şehir, ilçe ve mahalle belirtilmedi' },
        { status: 400 }
      );
    }
    
    const streetsData = getStreetsData(countryCode, city, district, neighborhood);
    
    return NextResponse.json(streetsData);
  } catch (error: any) {
    console.error('Sokak verisi API hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Sokak verisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 