/**
 * Client-side CSRF token kullanımı için yardımcı fonksiyonlar
 */

/**
 * CSRF token oluşturur
 * @returns {string} - Oluşturulan token
 */
export function generateCSRFToken() {
  return Array(32)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

/**
 * CSRF token'ı cookie olarak saklar
 * @param {string} token - CSRF token
 * @param {number} days - Token geçerlilik süresi (gün)
 */
export function setCSRFToken(token, days = 1) {
  setCookie('csrfToken', token, days);
}

/**
 * CSRF token'ı cookie'den alır
 * @returns {string|null} - CSRF token veya null
 */
export function getCSRFToken() {
  return getCookie('csrfToken');
}

/**
 * CSRF token'ı kontrol eder, yoksa oluşturup saklar
 * @returns {string} - Var olan veya yeni oluşturulan CSRF token
 */
export function ensureCSRFToken() {
  let token = getCSRFToken();
  
  if (!token) {
    token = generateCSRFToken();
    setCSRFToken(token);
  }
  
  return token;
}

/**
 * Cookie ayarlar
 * @param {string} name - Cookie adı
 * @param {string} value - Cookie değeri
 * @param {number} days - Geçerlilik süresi (gün)
 */
export function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=strict; ${
    window.location.protocol === 'https:' ? 'secure; ' : ''
  }`;
}

/**
 * Cookie değerini alır
 * @param {string} name - Cookie adı
 * @returns {string|null} - Cookie değeri veya null
 */
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
}

/**
 * CSRF token içeren header ekler
 * @param {object} headers - Headers objesi
 * @returns {object} - CSRF token eklenmiş headers
 */
export function addCSRFHeader(headers = {}) {
  const token = ensureCSRFToken();
  return {
    ...headers,
    'x-csrf-token': token,
  };
} 