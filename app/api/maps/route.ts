// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    
    // Burada Google Maps Geocoding API'ye istek atılacak
    // Şimdilik örnek bir yanıt döndürelim
    const mockResponse = {
      coordinates: {
        lat: 41.0082,
        lng: 28.9784
      },
      formattedAddress: address || 'İstanbul, Türkiye'
    };
    
    return NextResponse.json({ 
      success: true, 
      data: mockResponse 
    });
  } catch (error) {
    console.error('Maps API hatası:', error);
    return NextResponse.json(
      { success: false, error: 'İstek işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
