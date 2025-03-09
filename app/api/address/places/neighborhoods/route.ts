import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const city = searchParams.get('city');

    if (!country || !city) {
      return NextResponse.json({ error: 'Ülke ve şehir parametreleri gerekli' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API anahtarı bulunamadı' }, { status: 500 });
    }

    const query = `${city} ${country} mahalle`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=sublocality&components=country:${country}&key=${apiKey}&language=tr`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Google Places API yanıt vermedi');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Mahalle verileri alınırken hata:', error);
    return NextResponse.json({ error: 'Mahalle verileri alınamadı' }, { status: 500 });
  }
} 