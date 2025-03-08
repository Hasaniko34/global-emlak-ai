/**
 * Basit bir önbellek (cache) mekanizması
 * Belirli bir süre için API yanıtlarını hafızada tutar
 */

// Önbellek nesnesi
const cache = new Map();

/**
 * Önbellekten veri alır veya yoksa callback fonksiyonunu çalıştırıp sonucu önbelleğe kaydeder
 * @param {string} key - Önbellek anahtarı
 * @param {Function} callback - Veri yoksa çalıştırılacak async fonksiyon
 * @param {number} ttl - Önbellek süresi (milisaniye), varsayılan 1 saat
 * @returns {Promise<any>} - Önbellekteki veri veya callback'in sonucu
 */
export async function getCachedData(key, callback, ttl = 3600000) {
  const now = Date.now();
  
  // Önbellekte veri var mı ve süresi geçmiş mi kontrol et
  if (cache.has(key)) {
    const { data, expiry } = cache.get(key);
    
    // Süre dolmamışsa önbellekteki veriyi döndür
    if (now < expiry) {
      console.log(`Önbellekten veri alındı: ${key}`);
      return data;
    }
    
    // Süresi dolmuşsa önbellekten sil
    console.log(`Önbellek süresi doldu: ${key}`);
    cache.delete(key);
  }
  
  // Veri yoksa veya süresi geçmişse callback'i çalıştır
  console.log(`Yeni veri alınıyor: ${key}`);
  const data = await callback();
  
  // Sonucu önbelleğe kaydet
  cache.set(key, {
    data,
    expiry: now + ttl
  });
  
  return data;
}

/**
 * Önbelleği temizler
 * @param {string} [key] - Belirli bir anahtarı temizlemek için (opsiyonel)
 */
export function clearCache(key) {
  if (key) {
    cache.delete(key);
    console.log(`Önbellek temizlendi: ${key}`);
  } else {
    cache.clear();
    console.log('Tüm önbellek temizlendi');
  }
}

/**
 * Önbellek istatistiklerini döndürür
 * @returns {Object} - Önbellek istatistikleri
 */
export function getCacheStats() {
  const stats = {
    size: cache.size,
    keys: Array.from(cache.keys()),
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB cinsinden
  };
  
  return stats;
} 