// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { evaluateProperty } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { propertyType, location, size, rooms } = await request.json();
    
    // Girdi doğrulama
    if (!propertyType || !location || !size || !rooms) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanları doldurun' },
        { status: 400 }
      );
    }
    
    // Gemini API ile değerleme yap
    try {
      const result = await evaluateProperty({
        type: propertyType,
        location,
        size: Number(size),
        rooms: Number(rooms)
      });

      return NextResponse.json({ 
        success: true, 
        result
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Değerleme yapılırken bir hata oluştu' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'İstek işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
