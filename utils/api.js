/**
 * Genel API isteklerinde kullanılacak güvenlik önlemleri içeren dosya
 */

/**
 * CSRF korumalı fetch metodu
 * @param {string} url - İstek yapılacak URL
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch sonucu
 */
export const secureFetch = async (url, options = {}) => {
  // CSRF token'ı al
  let csrfToken = getCookie('csrfToken');
  
  // Token yoksa yeni bir token oluştur
  if (!csrfToken) {
    csrfToken = generateRandomToken();
    setCookie('csrfToken', csrfToken, 1); // 1 gün geçerli
  }
  
  // Header'lara CSRF token ekle
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  };
  
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

/**
 * Random token oluştur
 * @returns {string} - Random token
 */
const generateRandomToken = () => {
  return Array(32)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
};

/**
 * Cookie oluştur
 * @param {string} name - Cookie adı
 * @param {string} value - Cookie değeri
 * @param {number} days - Geçerlilik süresi (gün)
 */
const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=strict; ${
    window.location.protocol === 'https:' ? 'secure; ' : ''
  }`;
};

/**
 * Cookie değerini al
 * @param {string} name - Cookie adı
 * @returns {string|null} - Cookie değeri
 */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
}; 