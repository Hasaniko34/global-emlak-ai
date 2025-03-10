import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const neighborhood = searchParams.get('neighborhood');

    console.log('🔍 Gelen parametreler:', { country, city, neighborhood });

    // Test verisi döndür
    const testStreets = [
      { value: '1', label: 'Moda Caddesi' },
      { value: '2', label: 'Bahariye Caddesi' },
      { value: '3', label: 'Bağdat Caddesi' },
      { value: '4', label: 'Kalamış Caddesi' },
      { value: '5', label: 'Rıhtım Caddesi' },
      { value: '6', label: 'Söğütlüçeşme Caddesi' },
      { value: '7', label: 'Mühürdar Caddesi' },
      { value: '8', label: 'Recaizade Sokak' }
    ];

    return NextResponse.json({ predictions: testStreets });
  } catch (error) {
    console.error('❌ Hata:', error);
    return NextResponse.json({ 
      error: 'Sokak verileri alınamadı', 
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 