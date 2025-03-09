import validator from 'validator';
import xss from 'xss';

/**
 * XSS saldırılarını önlemek için metin girdilerini temizler
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;
  return xss(input.trim());
}

/**
 * E-posta adresini doğrular
 */
export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Şifre gücünü doğrular (minimum 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam)
 */
export function validatePassword(password: string): boolean {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  });
}

/**
 * URL'yi doğrular
 */
export function validateURL(url: string): boolean {
  return validator.isURL(url);
}

/**
 * Sayısal girdiyi doğrular
 */
export function validateNumeric(input: string): boolean {
  return validator.isNumeric(input);
}

/**
 * Tarih formatını doğrular (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean {
  return validator.isDate(date, { format: 'YYYY-MM-DD' });
}

/**
 * JSON verisini güvenli bir şekilde ayrıştırır
 */
export function safeParseJSON(jsonString: string, defaultValue = {}): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Objedeki tüm string alanları temizler (XSS koruması)
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item === 'string') {
          return sanitizeInput(item);
        } else if (item && typeof item === 'object') {
          return sanitizeObject(item);
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * Güvenlik girdisi hatalarını kontrol eder
 */
export function validateInputs(inputs: Record<string, any>, rules: Record<string, any>): { valid: boolean, errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const value = inputs[field];
    const rule = rules[field];
    
    // Zorunlu alan kontrolü
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} alanı zorunludur`;
      return;
    }
    
    // Değer yoksa diğer kuralları atla
    if (!value && !rule.required) return;
    
    // Minimum uzunluk kontrolü
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors[field] = `${field} en az ${rule.minLength} karakter olmalıdır`;
    }
    
    // Maksimum uzunluk kontrolü
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors[field] = `${field} en fazla ${rule.maxLength} karakter olmalıdır`;
    }
    
    // E-posta kontrolü
    if (rule.email && !validateEmail(value)) {
      errors[field] = `Geçerli bir e-posta adresi giriniz`;
    }
    
    // Şifre kontrolü
    if (rule.password && !validatePassword(value)) {
      errors[field] = `Şifre en az 8 karakter ve en az 1 büyük harf, 1 küçük harf, 1 rakam içermelidir`;
    }
    
    // Sayısal değer kontrolü
    if (rule.numeric && !validateNumeric(value)) {
      errors[field] = `${field} alanına sadece sayı girilmelidir`;
    }
    
    // URL kontrolü
    if (rule.url && !validateURL(value)) {
      errors[field] = `Geçerli bir URL giriniz`;
    }
    
    // Tarih kontrolü
    if (rule.date && !validateDate(value)) {
      errors[field] = `Geçerli bir tarih giriniz (YYYY-MM-DD)`;
    }
    
    // Minimum değer kontrolü
    if (rule.min !== undefined && Number(value) < rule.min) {
      errors[field] = `${field} en az ${rule.min} olmalıdır`;
    }
    
    // Maksimum değer kontrolü
    if (rule.max !== undefined && Number(value) > rule.max) {
      errors[field] = `${field} en fazla ${rule.max} olmalıdır`;
    }
    
    // Özel değer kontrolleri
    if (rule.custom && typeof rule.custom === 'function') {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
} 