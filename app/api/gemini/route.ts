// Rotayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir soru göndermelisiniz' },
        { status: 400 }
      );
    }
    
    // Gemini API'ye soruyu gönder
    const response = await askGemini(prompt);
    
    // Hata mesajı içeriyorsa
    if (response.includes('API anahtarı eksik') || response.includes('yanıt veremiyorum')) {
      return NextResponse.json(
        { success: false, error: response },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Gemini API hatası:', error);
    return NextResponse.json(
      { success: false, error: 'İstek işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 
