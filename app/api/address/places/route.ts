import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'address';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_API_KEY;
    if (!HERE_API_KEY) {
      return NextResponse.json({ error: 'Here Maps API anahtarı bulunamadı' }, { status: 500 });
    }

    let locationBias = '';
    if (lat && lng) {
      locationBias = `&in=circle:${lat},${lng};r=5000`;
    }

    const url = `https://discover.search.hereapi.com/v1/discover?` +
      `q=${encodeURIComponent(query)}&` +
      `apiKey=${HERE_API_KEY}&` +
      `lang=tr&` +
      `limit=10${locationBias}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Here Maps API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = data.items.map((item: any) => ({
      description: item.title,
      place_id: item.id,
      structured_formatting: {
        main_text: item.title,
        secondary_text: item.address?.label || ''
      }
    }));

    return NextResponse.json({ predictions: suggestions });
  } catch (error) {
    console.error('Yer arama hatası:', error);
    return NextResponse.json({ error: 'Yer araması başarısız oldu' }, { status: 500 });
  }
} 