/**
 * Genel API isteklerinde kullanılacak güvenlik önlemleri içeren dosya
 */
import { ensureCSRFToken, addCSRFHeader } from './csrf';

/**
 * CSRF korumalı fetch metodu
 * @param {string} url - İstek yapılacak URL
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch sonucu
 */
export const secureFetch = async (url, options = {}) => {
  // CSRF token'ı sağla
  ensureCSRFToken();
  
  // Header'lara CSRF token ekle
  const headers = addCSRFHeader({
    ...options.headers,
    'Content-Type': 'application/json',
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Rate limit hatası
    if (response.status === 429) {
      const data = await response.json();
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new Error(`${data.error || 'Rate limit aşıldı'} ${retryAfter} saniye sonra tekrar deneyin.`);
    }
    
    // Sunucu hatası
    if (response.status >= 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }
    
    // 401 Yetkisiz erişim
    if (response.status === 401) {
      // Kullanıcıyı giriş sayfasına yönlendir
      window.location.href = '/auth/signin';
      throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
    }
    
    // 403 Yasak erişim
    if (response.status === 403) {
      throw new Error('Bu işlemi yapmak için yetkiniz yok.');
    }
    
    return response;
  } catch (error) {
    // Ağ hataları
    if (error.message === 'Failed to fetch') {
      throw new Error('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
    }
    
    throw error;
  }
};

/**
 * GET isteği gönder
 * @param {string} url - İstek yapılacak URL
 * @param {object} options - Ek options
 * @returns {Promise} - İstek sonucu
 */
export const secureGet = async (url, options = {}) => {
  const response = await secureFetch(url, {
    method: 'GET',
    ...options,
  });
  return response.json();
};

/**
 * POST isteği gönder
 * @param {string} url - İstek yapılacak URL
 * @param {object} data - Gönderilecek veri
 * @param {object} options - Ek options
 * @returns {Promise} - İstek sonucu
 */
export const securePost = async (url, data, options = {}) => {
  const response = await secureFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
  return response.json();
};

/**
 * PUT isteği gönder
 * @param {string} url - İstek yapılacak URL
 * @param {object} data - Gönderilecek veri
 * @param {object} options - Ek options
 * @returns {Promise} - İstek sonucu
 */
export const securePut = async (url, data, options = {}) => {
  const response = await secureFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
  return response.json();
};

/**
 * DELETE isteği gönder
 * @param {string} url - İstek yapılacak URL
 * @param {object} options - Ek options
 * @returns {Promise} - İstek sonucu
 */
export const secureDelete = async (url, options = {}) => {
  const response = await secureFetch(url, {
    method: 'DELETE',
    ...options,
  });
  return response.json();
}; 