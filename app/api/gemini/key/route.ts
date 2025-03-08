// Rotayı dinamik olarak işaretle - client-side caching'i önlemek için
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

/**
 * Gemini API anahtarını döndüren endpoint
 * 
 * Gemini 2.0 Flash model kullanımı için:
 * - API Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
 * - API Key Format: 'x-goog-api-key' header'ında gönderilmeli (Bearer token değil)
 * - Google Cloud Console'dan yeni API anahtarı oluşturulmalı ve Gemini API etkinleştirilmeli
 * - API anahtarı için uygun kısıtlamalar (referrer, IP, vb.) ayarlanmalı
 */
export async function GET(request: Request) {
  try {
    // API anahtarını ortam değişkeninden al
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Server Configuration Error', 
          message: 'API anahtarı ayarlanmamış'
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // API anahtarını gönder
    return NextResponse.json({ key: apiKey });
  } catch (error) {
    console.error('API anahtarı alınırken hata:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'API anahtarı alınırken bir hata oluştu' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 