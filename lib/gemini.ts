import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// API anahtarını al
const apiKey = process.env.GEMINI_API_KEY;

// Gemini API istemcisini yapılandır
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Model yapılandırması
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Güvenlik ayarları
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function generateContent(prompt: string) {
  if (!genAI) {
    console.error('Gemini API anahtarı bulunamadı veya geçersiz');
    throw new Error('Gemini API anahtarı bulunamadı');
  }

  try {
    // Gemini Pro modelini kullan
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig,
      safetySettings,
    });

    // İçerik oluştur
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API hatası:', error);
    throw new Error('İçerik oluşturulurken bir hata oluştu');
  }
}

export async function askGemini(message: string) {
  const prompt = `
    Sen bir emlak danışmanısın. Lütfen aşağıdaki mesaja emlak konusunda yardımcı ol:
    
    ${message}
    
    Cevabın saygılı, bilgilendirici ve yardımcı olsun.
  `;

  try {
    return await generateContent(prompt);
  } catch (error) {
    console.error('Gemini soru-cevap hatası:', error);
    return "Üzgünüm, şu anda bu soruya yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
  }
}

export async function evaluateProperty(propertyData: any) {
  const prompt = `
    Aşağıdaki emlak bilgilerine göre tahmini bir değerleme yapın:
    
    Lokasyon: ${propertyData.location}
    Emlak Tipi: ${propertyData.type}
    Metrekare: ${propertyData.size}
    Oda Sayısı: ${propertyData.rooms}
    
    Değerlendirme şunları içermelidir:
    1. Tahmini değer
    2. Tahmini kira bedeli
    3. Yatırım getirisi (ROI)
    4. Kısa bir piyasa analizi
    
    Yanıtı aşağıdaki JSON formatında ver:
    {
      "estimatedValue": [değer],
      "currency": "TL",
      "confidenceLevel": "[Düşük/Orta/Yüksek]",
      "estimatedRent": [kira değeri],
      "roi": [yıllık getiri yüzdesi],
      "marketAnalysis": "[piyasa analizi]"
    }
  `;

  try {
    const response = await generateContent(prompt);
    
    // JSON yanıtı ayrıştır
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // JSON bulunamazsa hata fırlat
    throw new Error('Gemini yanıtı JSON formatında değil');
  } catch (error) {
    console.error('Değerleme hatası:', error);
    
    // Hata durumunda örnek değerleme döndür
    return {
      estimatedValue: 2500000,
      currency: "TL",
      confidenceLevel: "Düşük",
      estimatedRent: 10000,
      roi: 4.8,
      marketAnalysis: "Bu bölgede emlak fiyatları istikrarlı. Benzer özellikteki gayrimenkuller için talep normal seviyede."
    };
  }
} 