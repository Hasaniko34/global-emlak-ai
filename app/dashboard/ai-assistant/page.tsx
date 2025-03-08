'use client';

import { useState, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function AIAssistantPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: 'Merhaba! Ben Global Emlak AI asistanıyım. Size nasıl yardımcı olabilirim?',
    },
  ]);

  useEffect(() => {
    // Gemini API anahtarını alıyoruz
    fetch('/api/gemini/key')
      .then(response => response.json())
      .then(data => {
        setApiKey(data.key);
      })
      .catch(error => {
        console.error('API anahtarı alınamadı:', error);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !apiKey) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage('');

    try {
      // Gemini 2.0 Flash modeli için güncellenmiş API endpoint
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey  // API anahtarı formatı değiştirildi
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `Sen bir emlak asistanısın. Kullanıcıya emlak konusunda yardımcı oluyorsun. Emlak değerleme, gayrimenkul yatırımları, kira analizleri ve bölgesel piyasa trendleri konularında uzmansın. Türkçe konuşuyorsun ve Türkiye emlak piyasası hakkında bilgi sahibisin. 

Kullanıcının sorusu: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseMimeType: "text/plain",
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug için

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const aiResponse = {
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
      };
      setChatHistory((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI yanıtı alınamadı:', error);
      const errorResponse = {
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin. Eğer sorun devam ederse, daha sonra tekrar deneyebilirsiniz.',
      };
      setChatHistory((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                chat.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {chat.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !apiKey}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 