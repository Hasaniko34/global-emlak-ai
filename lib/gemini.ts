import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// API anahtarını al
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

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

  return generateContent(prompt);
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
  `;

  return generateContent(prompt);
} 