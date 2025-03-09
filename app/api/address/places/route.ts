import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Query parametrelerini al
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type') || 'neighborhood'; // 'neighborhood' veya 'street'
  const country = searchParams.get('country');
  const city = searchParams.get('city');

  if (!query) {
    return NextResponse.json({ error: 'Arama sorgusu belirtilmedi' }, { status: 400 });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API anahtarı bulunamadı' }, { status: 500 });
    }

    // Şehir veya ülke belirtildiyse, sonuçları filtrele
    let locationBias = '';
    if (city) {
      locationBias = `&locationBias=locality:${city}`;
    } else if (country) {
      locationBias = `&locationBias=country:${country}`;
    }

    // Places API'ye istek at
    const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=${type}${locationBias}&language=tr&key=${apiKey}`;
    
    const response = await fetch(placesUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Google Places API hatası: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Yanıtı formatla
    const results = data.predictions.map((prediction: any) => ({
      place_id: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      description: prediction.description,
      secondaryText: prediction.structured_formatting.secondary_text,
      types: prediction.types
    }));
    
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('Google Places API hatası:', error);
    return NextResponse.json({ error: 'Adres verileri getirilemedi' }, { status: 500 });
  }
} 