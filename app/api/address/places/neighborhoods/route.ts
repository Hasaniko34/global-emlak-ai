import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const city = searchParams.get('city');

    console.log('🔍 Gelen parametreler:', { country, city });

    // Test verisi döndür
    const testNeighborhoods = [
      { value: '1', label: 'Caferağa Mahallesi' },
      { value: '2', label: 'Fenerbahçe Mahallesi' },
      { value: '3', label: 'Göztepe Mahallesi' },
      { value: '4', label: 'Koşuyolu Mahallesi' },
      { value: '5', label: 'Moda Mahallesi' },
      { value: '6', label: 'Osmanağa Mahallesi' },
      { value: '7', label: 'Rasimpaşa Mahallesi' },
      { value: '8', label: 'Zühtüpaşa Mahallesi' }
    ];

    return NextResponse.json({ predictions: testNeighborhoods });
  } catch (error) {
    console.error('❌ Hata:', error);
    return NextResponse.json({ 
      error: 'Mahalle verileri alınamadı', 
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 