// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Adres parametresi gerekli' }, { status: 400 });
    }

    const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_API_KEY;
    if (!HERE_API_KEY) {
      return NextResponse.json({ error: 'Here Maps API anahtarı bulunamadı' }, { status: 500 });
    }

    const url = `https://geocode.search.hereapi.com/v1/geocode?` +
      `q=${encodeURIComponent(address)}&` +
      `apiKey=${HERE_API_KEY}&` +
      `lang=tr`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Here Maps API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });
    }

    const location = data.items[0].position;
    return NextResponse.json({
      lat: location.lat,
      lng: location.lng,
      formatted_address: data.items[0].address.label
    });
  } catch (error) {
    console.error('Geocoding hatası:', error);
    return NextResponse.json({ error: 'Adres koordinatları alınamadı' }, { status: 500 });
  }
} 
